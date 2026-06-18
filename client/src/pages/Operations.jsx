import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const Operations = () => {
  const { operations, beneficiaires, taux, fetchOperations, fetchStats } = useApp();
  const [filterBene, setFilterBene] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('');
  const [form, setForm] = useState({ beneficiaire_id: '', montant_eur: '', frais: '', date_envoi: '', note: '' });
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
    }
  }, [form.beneficiaire_id, form.montant_eur]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bene = beneficiaires.find(b => b.id == form.beneficiaire_id);
    const tauxBene = taux.find(t => t.devise === bene?.devise);
    try {
      await axios.post('/operations', {
        ...form,
        montant_devise: montantDevise,
        devise: bene?.devise || 'EUR',
        taux_applique: tauxBene?.taux || 1
      });
      fetchOperations();
      fetchStats();
      setForm({ beneficiaire_id: '', montant_eur: '', frais: '', date_envoi: '', note: '' });
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
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Bénéficiaire</label>
                <select style={styles.input} value={form.beneficiaire_id}
                  onChange={e => setForm({...form, beneficiaire_id: e.target.value})} required>
                  <option value="">Sélectionner</option>
                  {beneficiaires.map(b => (
                    <option key={b.id} value={b.id}>{b.nom} — {b.pays}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Montant envoyé (€)</label>
                <input style={styles.input} type="number" placeholder="0.00" step="0.01"
                  value={form.montant_eur} onChange={e => setForm({...form, montant_eur: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Frais (€)</label>
                <input style={styles.input} type="number" placeholder="0.00" step="0.01"
                  value={form.frais} onChange={e => setForm({...form, frais: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}>Date</label>
                <input style={styles.input} type="date"
                  value={form.date_envoi} onChange={e => setForm({...form, date_envoi: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Note</label>
                <input style={styles.input} type="text" placeholder="Ex: loyer, cadeau..."
                  value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
              {montantDevise > 0 && (
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

      <div style={styles.filters}>
        <select style={styles.filterInput} value={filterBene} onChange={e => setFilterBene(e.target.value)}>
          <option value="">Tous les bénéficiaires</option>
          {beneficiaires.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
        <select style={styles.filterInput} value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}>
          <option value="">Toutes les années</option>
          {annees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {operations.length > 0 && (
          <div style={styles.total}>Total : <strong>{total.toFixed(2)} €</strong></div>
        )}
      </div>

      <div style={styles.list}>
        {operations.map(op => (
          <div key={op.id} style={styles.opItem}>
            <div style={styles.opLeft}>
              <div style={styles.avatar}>{op.Beneficiaire?.nom?.charAt(0)}</div>
              <div>
                <p style={styles.opNom}>{op.Beneficiaire?.nom}</p>
                <p style={styles.opInfo}>{op.date_envoi} — {op.Beneficiaire?.pays}</p>
                {op.note && <p style={styles.opNote}>{op.note}</p>}
                {op.frais > 0 && <p style={styles.opNote}>Frais : {op.frais} €</p>}
              </div>
            </div>
            <div style={styles.opRight}>
              <p style={styles.opMontant}>-{op.montant_eur?.toFixed(2)} €</p>
              <p style={styles.opDevise}>{op.montant_devise?.toFixed(2)} {op.devise}</p>
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
  container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#0C447C' },
  btnAdd: { background: '#0C447C', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  formCard: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  conversion: { background: '#E6F1FB', borderRadius: '8px', padding: '10px', gridColumn: 'span 2' },
  conversionValue: { fontSize: '18px', fontWeight: '700', color: '#0C447C' },
  btnSubmit: { marginTop: '16px', width: '100%', padding: '11px', background: '#0C447C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  filters: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' },
  filterInput: { padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' },
  total: { marginLeft: 'auto', fontSize: '14px', color: '#333' },
  list: { background: 'white', borderRadius: '12px', padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  opItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  opLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' },
  opNom: { fontSize: '14px', fontWeight: '600', color: '#333' },
  opInfo: { fontSize: '12px', color: '#888' },
  opNote: { fontSize: '12px', color: '#aaa' },
  opRight: { textAlign: 'right' },
  opMontant: { fontSize: '15px', fontWeight: '700', color: '#A32D2D' },
  opDevise: { fontSize: '12px', color: '#888' },
  btnDel: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginTop: '4px' },
  empty: { textAlign: 'center', color: '#aaa', padding: '30px' }
};

export default Operations;