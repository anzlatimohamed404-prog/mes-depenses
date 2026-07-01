import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const CATEGORIES = [
  { value: 'virement', label: 'Virement', icon: '👤' },
  { value: 'carburant', label: 'Carburant', icon: '⛽' },
  { value: 'courses', label: 'Courses', icon: '🛒' },
  { value: 'factures', label: 'Factures', icon: '📄' },
  { value: 'loisirs', label: 'Loisirs', icon: '🎉' },
  { value: 'sante', label: 'Santé', icon: '🏥' },
];

const getIcon = (cat) => CATEGORIES.find(c => c.value === cat)?.icon || '📦';
const getLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label || cat;

const Operations = () => {
  const { operations, beneficiaires, taux, fetchOperations, fetchStats } = useApp();
  const [filterBene, setFilterBene] = useState('');
  const [filterBeneSearch, setFilterBeneSearch] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('');
  const [filterAnneeSearch, setFilterAnneeSearch] = useState('');
  const [form, setForm] = useState({ categorie: '', beneficiaire_id: '', montant_eur: '', date_envoi: '', note: '' });
  const [categorieSearch, setCategorieSearch] = useState('');
  const [beneSearch, setBeneSearch] = useState('');
  const [montantDevise, setMontantDevise] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchOperations({ beneficiaire_id: filterBene, annee: filterAnnee });
  }, [filterBene, filterAnnee]);

  useEffect(() => {
    if (form.beneficiaire_id && form.montant_eur) {
      const bene = beneficiaires.find(b => b.id == form.beneficiaire_id);
      if (bene) {
        const tauxBene = taux.find(t => t.devise === bene.devise);
        if (tauxBene) {
          setMontantDevise((parseFloat(form.montant_eur) * tauxBene.taux).toFixed(2));
        }
      }
    } else {
      setMontantDevise(0);
    }
  }, [form.beneficiaire_id, form.montant_eur]);

  const ouvrirFormPour = (beneficiaireId) => {
    const bene = beneficiaires.find(b => b.id === beneficiaireId);
    setForm({ ...form, categorie: 'virement', beneficiaire_id: String(beneficiaireId) });
    setCategorieSearch('Virement');
    setBeneSearch(bene?.nom || '');
    setShowForm(true);
  };

  const choisirCategorie = (cat) => {
    setForm({ ...form, categorie: cat.value, beneficiaire_id: cat.value !== 'virement' ? '' : form.beneficiaire_id });
    setCategorieSearch(cat.label);
    if (cat.value !== 'virement') setBeneSearch('');
  };

  const ecrireCategorieLibre = (texte) => {
    setCategorieSearch(texte);
    setForm({ ...form, categorie: texte, beneficiaire_id: '' });
    setBeneSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bene = beneficiaires.find(b => b.id == form.beneficiaire_id);
    const tauxBene = taux.find(t => t.devise === bene?.devise);
    try {
      await axios.post('/operations', {
        ...form,
        beneficiaire_id: form.beneficiaire_id || null,
        montant_devise: form.beneficiaire_id ? montantDevise : null,
        devise: bene?.devise || null,
        taux_applique: tauxBene?.taux || 1
      });
      fetchOperations();
      fetchStats();
      setForm({ categorie: '', beneficiaire_id: '', montant_eur: '', date_envoi: '', note: '' });
      setCategorieSearch('');
      setBeneSearch('');
      setShowForm(false);
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette opération ?')) return;
    try {
      await axios.delete(`/operations/${id}`);
      fetchOperations();
      fetchStats();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const annees = [...new Set(operations.map(o => o.date_envoi?.split('-')[0]))].sort().reverse();
  const total = operations.reduce((s, o) => s + o.montant_eur, 0);

  const categoriesFiltrees = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(categorieSearch.toLowerCase())
  );

  const beneficiairesFiltres = beneficiaires.filter(b =>
    b.nom.toLowerCase().includes(beneSearch.toLowerCase())
  );

  const beneficiairesFiltreRecherche = beneficiaires.filter(b =>
    b.nom.toLowerCase().includes(filterBeneSearch.toLowerCase())
  );

  const anneesFiltrees = annees.filter(a => a.includes(filterAnneeSearch));
  const isVirement = form.categorie === 'virement';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Opérations</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
          {showForm ? '✕ Fermer' : '+ Nouvelle opération'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Nouvelle opération</h2>
          <form onSubmit={handleSubmit}>
            <div className="operations-form-grid">
              <div style={{position: 'relative'}}>
                <label style={styles.label}>Catégorie</label>
                <input style={styles.input} type="text" placeholder="Choisir ou écrire une catégorie..."
                  value={categorieSearch}
                  onChange={e => ecrireCategorieLibre(e.target.value)}
                  required />
                {categorieSearch && (
                  <div style={styles.dropdown}>
                    {categoriesFiltrees.map(c => (
                      <div key={c.value} style={styles.dropdownItem} onClick={() => choisirCategorie(c)}>
                        {c.icon} {c.label}
                      </div>
                    ))}
                    {categoriesFiltrees.length === 0 && (
                      <div style={styles.dropdownEmpty}>Catégorie personnalisée : "{categorieSearch}"</div>
                    )}
                  </div>
                )}
              </div>

              {isVirement && (
                <div style={{position: 'relative'}}>
                  <label style={styles.label}>Bénéficiaire</label>
                  <input style={styles.input} type="text" placeholder="Rechercher un bénéficiaire..."
                    value={beneSearch}
                    onChange={e => { setBeneSearch(e.target.value); setForm({...form, beneficiaire_id: ''}); }}
                    required={isVirement && !form.beneficiaire_id} />
                  {beneSearch && !form.beneficiaire_id && (
                    <div style={styles.dropdown}>
                      {beneficiairesFiltres.map(b => (
                        <div key={b.id} style={styles.dropdownItem}
                          onClick={() => { setForm({...form, beneficiaire_id: String(b.id)}); setBeneSearch(b.nom); }}>
                          {b.nom} — {b.pays}
                        </div>
                      ))}
                      {beneficiairesFiltres.length === 0 && <div style={styles.dropdownEmpty}>Aucun résultat</div>}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={styles.label}>Montant (€)</label>
                <input style={styles.input} type="number" placeholder="0.00" step="0.01"
                  value={form.montant_eur} onChange={e => setForm({...form, montant_eur: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Date</label>
                <input style={styles.input} type="date"
                  value={form.date_envoi} onChange={e => setForm({...form, date_envoi: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Note</label>
                <input style={styles.input} type="text" placeholder="Ex: plein essence, courses Carrefour..."
                  value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
              {isVirement && montantDevise > 0 && (
                <div style={styles.conversion}>
                  <p>Le bénéficiaire reçoit :</p>
                  <p style={styles.conversionValue}>{montantDevise} {beneficiaires.find(b => b.id == form.beneficiaire_id)?.devise}</p>
                </div>
              )}
            </div>
            <button style={styles.btnSubmit} type="submit">Enregistrer</button>
          </form>
        </div>
      )}

      <div style={styles.beneList}>
        {beneficiaires.map(b => (
          <div key={b.id} className="operations-bene-row">
            <div style={styles.beneInfo}>
              <div style={styles.avatar}>{b.nom?.charAt(0)}</div>
              <div>
                <p style={styles.beneNom}>{b.nom}</p>
                <p style={styles.beneSub}>{b.pays} — {b.devise}</p>
              </div>
            </div>
            <button onClick={() => ouvrirFormPour(b.id)} style={styles.btnEffectuer}>
              Effectuer une opération
            </button>
          </div>
        ))}
        {beneficiaires.length === 0 && (
          <p style={styles.empty}>Ajoute d'abord un bénéficiaire dans "Liste des dépenses"</p>
        )}
      </div>

      <div className="operations-filters">
        <div style={{position: 'relative'}}>
          <input style={styles.filterInput} type="text" placeholder="Rechercher un bénéficiaire..."
            value={filterBeneSearch}
            onChange={e => setFilterBeneSearch(e.target.value)} />
          {filterBeneSearch && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownItem} onClick={() => { setFilterBene(''); setFilterBeneSearch(''); }}>
                Tous les bénéficiaires
              </div>
              {beneficiairesFiltreRecherche.map(b => (
                <div key={b.id} style={styles.dropdownItem}
                  onClick={() => { setFilterBene(String(b.id)); setFilterBeneSearch(b.nom); }}>
                  {b.nom}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{position: 'relative'}}>
          <input style={styles.filterInput} type="text" placeholder="Rechercher une année..."
            value={filterAnneeSearch}
            onChange={e => setFilterAnneeSearch(e.target.value)} />
          {filterAnneeSearch && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownItem} onClick={() => { setFilterAnnee(''); setFilterAnneeSearch(''); }}>
                Toutes les années
              </div>
              {anneesFiltrees.map(a => (
                <div key={a} style={styles.dropdownItem}
                  onClick={() => { setFilterAnnee(a); setFilterAnneeSearch(a); }}>
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>

        {operations.length > 0 && (
          <div style={styles.total}>Total : <strong>{total.toFixed(2)} €</strong></div>
        )}
      </div>

      <div style={styles.list}>
        {operations.map(op => (
          <div key={op.id} style={styles.opItem}>
            <div style={styles.opLeft}>
              <div style={styles.avatar}>
                {op.categorie === 'virement' ? op.Beneficiaire?.nom?.charAt(0) : getIcon(op.categorie)}
              </div>
              <div>
                <p style={styles.opNom}>
                  {op.categorie === 'virement' ? op.Beneficiaire?.nom : getLabel(op.categorie)}
                </p>
                <p style={styles.opInfo}>
                  {op.date_envoi}{op.categorie === 'virement' && op.Beneficiaire?.pays ? ` — ${op.Beneficiaire.pays}` : ''}
                </p>
                {op.note && <p style={styles.opNote}>{op.note}</p>}
              </div>
            </div>
            <div style={styles.opRight}>
              <p style={styles.opMontant}>+{op.montant_eur?.toFixed(2)} €</p>
              {op.montant_devise && <p style={styles.opDevise}>{op.montant_devise?.toFixed(2)} {op.devise}</p>}
              <button onClick={() => handleDelete(op.id)} style={styles.btnDel}>🗑️</button>
            </div>
          </div>
        ))}
        {operations.length === 0 && <p style={styles.empty}>Aucune opération</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '16px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '700', color: 'var(--primary-color)' },
  btnAdd: { background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  formCard: { background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' },
  label: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '8px', marginTop: '4px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' },
  dropdownEmpty: { padding: '10px 12px', fontSize: '13px', color: '#aaa' },
  conversion: { background: '#E6F1FB', borderRadius: '8px', padding: '10px' },
  conversionValue: { fontSize: '18px', fontWeight: '700', color: 'var(--primary-color)' },
  btnSubmit: { marginTop: '16px', width: '100%', padding: '11px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  beneList: { background: 'white', borderRadius: '12px', padding: '8px 16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  beneInfo: { display: 'flex', gap: '12px', alignItems: 'center' },
  beneNom: { fontSize: '14px', fontWeight: '600', color: '#333' },
  beneSub: { fontSize: '12px', color: '#888' },
  btnEffectuer: { background: '#E6F1FB', color: 'var(--primary-color)', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' },
  filterInput: { padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', width: '100%' },
  total: { fontSize: '14px', color: '#333', paddingTop: '8px' },
  list: { background: 'white', borderRadius: '12px', padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  opItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  opLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#E6F1FB', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  opNom: { fontSize: '14px', fontWeight: '600', color: '#333' },
  opInfo: { fontSize: '12px', color: '#888' },
  opNote: { fontSize: '12px', color: '#aaa' },
  opRight: { textAlign: 'right', flexShrink: 0, marginLeft: '8px' },
  opMontant: { fontSize: '15px', fontWeight: '700', color: 'var(--primary-color)' },
  opDevise: { fontSize: '12px', color: '#888' },
  btnDel: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginTop: '4px' },
  empty: { textAlign: 'center', color: '#aaa', padding: '30px' }
};

export default Operations;