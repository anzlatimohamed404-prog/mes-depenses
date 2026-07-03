import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const PAYS = [
  { nom: 'Comores', devise: 'KMF' },
  { nom: 'Madagascar', devise: 'MGA' },
  { nom: 'France', devise: 'EUR' },
  { nom: 'Mayotte', devise: 'EUR' },
  { nom: 'Autre', devise: 'USD' },
];

const Beneficiaires = () => {
  const { beneficiaires, operations, fetchBeneficiaires } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterAnnee, setFilterAnnee] = useState('');
  const [form, setForm] = useState({ nom: '', pays: '', devise: '', relation: 'famille' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaysChange = (pays) => {
    const p = PAYS.find(p => p.nom === pays);
    setForm({...form, pays, devise: p?.devise || ''});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    if (!form.nom || !form.pays || !form.devise) {
      setFeedback('Veuillez remplir le nom, le pays et la devise.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/beneficiaires', form);
      fetchBeneficiaires();
      setForm({ nom: '', pays: '', devise: '', relation: 'famille' });
      setShowForm(false);
      setFeedback('Bénéficiaire ajouté avec succès.');
    } catch (error) {
      setFeedback('Erreur lors de l\'ajout.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce bénéficiaire ?')) return;
    setFeedback('');
    try {
      await axios.delete(`/beneficiaires/${id}`);
      fetchBeneficiaires();
      setSelected(null);
      setFeedback('Bénéficiaire supprimé.');
    } catch (error) {
      setFeedback('Erreur lors de la suppression.');
    }
  };

  const getOpsBene = (beneId) => {
    let ops = operations.filter(o => o.beneficiaire_id === beneId);
    if (filterAnnee) ops = ops.filter(o => o.date_envoi?.startsWith(filterAnnee));
    return ops;
  };

  const getTotalBene = (beneId) => {
    return getOpsBene(beneId).reduce((s, o) => s + o.montant_eur, 0);
  };

  const annees = [...new Set(operations.map(o => o.date_envoi?.split('-')[0]))].sort().reverse();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Liste des dépenses</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
          {showForm ? '✕ Fermer' : '+ Ajouter'}
        </button>
      </div>

      {feedback && <p style={styles.feedback}>{feedback}</p>}

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Nouveau bénéficiaire</h2>
          <form onSubmit={handleSubmit}>
            <div className="bene-form-grid">
              <div>
                <label style={styles.label}>Nom</label>
                <input style={styles.input} type="text" placeholder="Nom complet"
                  value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Pays</label>
                <select style={styles.input} value={form.pays}
                  onChange={e => handlePaysChange(e.target.value)} required>
                  <option value="">Sélectionner</option>
                  {PAYS.map(p => <option key={p.nom} value={p.nom}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Devise</label>
                <input style={styles.input} type="text" placeholder="Ex: KMF, MGA..."
                  value={form.devise} onChange={e => setForm({...form, devise: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Relation</label>
                <select style={styles.input} value={form.relation}
                  onChange={e => setForm({...form, relation: e.target.value})}>
                  <option value="famille">Famille</option>
                  <option value="ami">Ami</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <button style={styles.btnSubmit} type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {beneficiaires.map(b => (
          <div key={b.id} style={styles.card} onClick={() => setSelected(selected?.id === b.id ? null : b)}>
            <div className="bene-card-top">
              <div style={styles.avatar}>{b.nom?.charAt(0)}</div>
              <div style={{flex: 1}}>
                <p style={styles.cardNom}>{b.nom}</p>
                <p style={styles.cardInfo}>{b.pays} — {b.devise}</p>
                <span style={styles.tag}>{b.relation}</span>
              </div>
              <div className="bene-card-right">
                <p style={styles.cardTotal}>+{getTotalBene(b.id).toFixed(2)} €</p>
                <p style={styles.cardCount}>{operations.filter(o => o.beneficiaire_id === b.id).length} envois</p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/operations', { state: { beneficiaireId: b.id } }); }}
                  style={styles.btnEffectuer}>
                  Effectuer une opération
                </button>
              </div>
            </div>

            {selected?.id === b.id && (
              <div style={styles.detail}>
                <div style={styles.detailHeader}>
                  <select style={styles.filterInput} value={filterAnnee}
                    onChange={e => setFilterAnnee(e.target.value)}>
                    <option value="">Toutes les années</option>
                    {annees.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} style={styles.btnDel}>
                    🗑️ Supprimer
                  </button>
                </div>
                {getOpsBene(b.id).map(op => (
                  <div key={op.id} style={styles.opItem}>
                    <div>
                      <p style={styles.opDate}>{op.date_envoi}</p>
                      {op.note && <p style={styles.opNote}>{op.note}</p>}
                    </div>
                    <div style={styles.opRight}>
                      <p style={styles.opMontant}>+{op.montant_eur?.toFixed(2)} €</p>
                      <p style={styles.opDevise}>{op.montant_devise?.toFixed(2)} {op.devise}</p>
                    </div>
                  </div>
                ))}
                {getOpsBene(b.id).length === 0 && <p style={styles.empty}>Aucune opération</p>}
                <div style={styles.totalBar}>
                  <span>Total {filterAnnee || 'général'}</span>
                  <strong style={{color:'var(--primary-color)'}}>{getTotalBene(b.id).toFixed(2)} €</strong>
                </div>
              </div>
            )}
          </div>
        ))}
        {beneficiaires.length === 0 && <p style={styles.empty}>Aucun bénéficiaire</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '16px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '700', color: 'var(--primary-color)' },
  feedback: { padding: '10px 12px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', marginBottom: '12px', fontSize: '13px' },
  btnAdd: { background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  formCard: { background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' },
  label: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  btnSubmit: { marginTop: '16px', width: '100%', padding: '11px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: '#E6F1FB', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 },
  cardNom: { fontSize: '15px', fontWeight: '600', color: '#333' },
  cardInfo: { fontSize: '12px', color: '#888' },
  tag: { fontSize: '11px', background: '#E6F1FB', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '20px' },
  cardTotal: { fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)' },
  cardCount: { fontSize: '12px', color: '#888' },
  btnEffectuer: { marginTop: '8px', background: '#E6F1FB', color: 'var(--primary-color)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
  detail: { marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  filterInput: { padding: '7px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' },
  btnDel: { background: 'none', border: '1px solid #A32D2D', color: '#A32D2D', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  opItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9f9f9' },
  opDate: { fontSize: '13px', color: '#555' },
  opNote: { fontSize: '12px', color: '#aaa' },
  opRight: { textAlign: 'right', flexShrink: 0 },
  opMontant: { fontSize: '14px', fontWeight: '600', color: 'var(--primary-color)' },
  opDevise: { fontSize: '12px', color: '#888' },
  totalBar: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '10px', background: '#f9f9f9', borderRadius: '8px', fontSize: '14px' },
  empty: { textAlign: 'center', color: '#aaa', padding: '20px' }
};

export default Beneficiaires;