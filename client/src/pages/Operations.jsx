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
  const [filterAnnee, setFilterAnnee] = useState('');
  const [form, setForm] = useState({ categorie: '', beneficiaire_id: '', montant_eur: '', date_envoi: '', note: '' });
  const [categorieSearch, setCategorieSearch] = useState('');
  const [beneSearch, setBeneSearch] = useState('');
  const [montantDevise, setMontantDevise] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showAllOperations, setShowAllOperations] = useState(false);

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

  const isVirement = form.categorie === 'virement';
  const visibleOperations = showAllOperations ? operations : operations.slice(0, 3);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Gestion</p>
          <h1 style={styles.title}>Opérations</h1>
        </div>
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
                        <div
                          key={b.id}
                          style={styles.dropdownItem}
                          onClick={() => {
                            setForm({ ...form, beneficiaire_id: String(b.id) });
                            setBeneSearch(b.nom);
                          }}
                        >
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
        <div style={styles.sectionTitleRow}>
          <h2 style={styles.sectionTitle}>Bénéficiaires rapides</h2>
          <span style={styles.sectionHint}>Sélectionne un destinataire</span>
        </div>
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

      <div className="operations-filters" style={styles.filtersBar}>
        <select
          style={styles.filterInput}
          value={filterBene}
          onChange={e => setFilterBene(e.target.value)}
        >
          <option value="">Tous les bénéficiaires</option>
          {beneficiaires.map(b => (
            <option key={b.id} value={String(b.id)}>{b.nom}</option>
          ))}
        </select>

        <select
          style={styles.filterInput}
          value={filterAnnee}
          onChange={e => setFilterAnnee(e.target.value)}
        >
          <option value="">Toutes les années</option>
          {annees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {operations.length > 0 && (
          <div style={styles.total}>Total : <strong>{total.toFixed(2)} €</strong></div>
        )}
      </div>

      <div style={styles.list}>
        <div style={styles.sectionTitleRow}>
          <h2 style={styles.sectionTitle}>Historique</h2>
          <span style={styles.sectionHint}>Dernières entrées enregistrées</span>
        </div>
        {visibleOperations.map(op => (
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
        {operations.length > 3 && (
          <button onClick={() => setShowAllOperations(!showAllOperations)} style={styles.showMoreBtn}>
            {showAllOperations ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
        {operations.length === 0 && <p style={styles.empty}>Aucune opération</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '16px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' },
  eyebrow: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-secondary)', marginBottom: '4px' },
  title: { fontSize: '22px', fontWeight: '700', color: 'var(--primary-color)', margin: 0 },
  btnAdd: { background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
  formCard: { background: 'var(--bg-card)', borderRadius: '18px', padding: '18px', marginBottom: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  formTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' },
  label: { fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box', background: 'var(--input-bg)', color: 'var(--text)' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '4px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 8px 18px rgba(0,0,0,0.08)' },
  dropdownItem: { padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid var(--border)', color: 'var(--text)' },
  dropdownEmpty: { padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' },
  conversion: { background: 'var(--accent-soft)', borderRadius: '12px', padding: '10px 12px', border: '1px solid rgba(20, 184, 166, 0.18)' },
  conversionValue: { fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)', marginTop: '4px' },
  btnSubmit: { marginTop: '16px', width: '100%', padding: '11px 12px', background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  beneList: { background: 'var(--bg-card)', borderRadius: '18px', padding: '14px 16px', marginBottom: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  sectionTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: 'var(--text)', margin: 0 },
  sectionHint: { fontSize: '12px', color: 'var(--text-secondary)' },
  beneInfo: { display: 'flex', gap: '12px', alignItems: 'center' },
  beneNom: { fontSize: '14px', fontWeight: '600', color: 'var(--text)' },
  beneSub: { fontSize: '12px', color: 'var(--text-secondary)' },
  btnEffectuer: { background: 'var(--primary-soft)', color: 'var(--primary-color)', border: 'none', padding: '8px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' },
  filtersBar: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' },
  filterInput: { padding: '9px 12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', minWidth: '180px' },
  total: { fontSize: '14px', color: 'var(--text)', paddingTop: '6px' },
  list: { background: 'var(--bg-card)', borderRadius: '18px', padding: '14px 16px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  opItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)', gap: '12px' },
  opLeft: { display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  opNom: { fontSize: '14px', fontWeight: '600', color: 'var(--text)' },
  opInfo: { fontSize: '12px', color: 'var(--text-secondary)' },
  opNote: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' },
  opRight: { textAlign: 'right', flexShrink: 0, marginLeft: '8px' },
  opMontant: { fontSize: '15px', fontWeight: '700', color: 'var(--primary-color)' },
  opDevise: { fontSize: '12px', color: 'var(--text-secondary)' },
  btnDel: { background: 'var(--danger-soft)', border: 'none', cursor: 'pointer', fontSize: '16px', marginTop: '4px', padding: '6px 8px', borderRadius: '10px' },
  showMoreBtn: { marginTop: '10px', width: '100%', padding: '10px 12px', background: 'var(--primary-soft)', color: 'var(--primary-color)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  empty: { textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }
};

export default Operations;