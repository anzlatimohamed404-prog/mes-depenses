import { useState } from 'react';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const Parametres = () => {
  const { taux, fetchTaux } = useApp();
  const [form, setForm] = useState({ pays: '', devise: '', taux: '' });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/taux-change', form);
      fetchTaux();
      setForm({ pays: '', devise: '', taux: '' });
      setShowForm(false);
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce taux ?')) return;
    try {
      await axios.delete(`/taux-change/${id}`);
      fetchTaux();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Paramètres — Taux de change</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
          {showForm ? '✕ Fermer' : '+ Ajouter un taux'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Nouveau taux de change</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Pays</label>
                <input style={styles.input} type="text" placeholder="Ex: Comores"
                  value={form.pays} onChange={e => setForm({...form, pays: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Devise</label>
                <input style={styles.input} type="text" placeholder="Ex: KMF"
                  value={form.devise} onChange={e => setForm({...form, devise: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Taux (1 € = X devise)</label>
                <input style={styles.input} type="number" placeholder="Ex: 491.96" step="0.01"
                  value={form.taux} onChange={e => setForm({...form, taux: e.target.value})} required />
              </div>
            </div>
            <button style={styles.btnSubmit} type="submit">Enregistrer</button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {taux.map(t => (
          <div key={t.id} style={styles.tauxItem}>
            <div>
              <p style={styles.tauxPays}>{t.pays}</p>
              <p style={styles.tauxDevise}>{t.devise}</p>
            </div>
            <div style={styles.tauxRight}>
              <p style={styles.tauxValeur}>1 € = {t.taux} {t.devise}</p>
              <button onClick={() => handleDelete(t.id)} style={styles.btnDel}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
        {taux.length === 0 && (
          <div style={styles.empty}>
            <p>Aucun taux de change configuré</p>
            <p style={{fontSize:'13px', marginTop:'8px'}}>Exemple : 1 € = 491.96 KMF pour les Comores</p>
          </div>
        )}
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  label: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  btnSubmit: { marginTop: '16px', width: '100%', padding: '11px', background: '#0C447C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  list: { background: 'white', borderRadius: '12px', padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tauxItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0' },
  tauxPays: { fontSize: '15px', fontWeight: '600', color: '#333' },
  tauxDevise: { fontSize: '12px', color: '#888' },
  tauxRight: { textAlign: 'right' },
  tauxValeur: { fontSize: '14px', fontWeight: '600', color: '#0C447C', marginBottom: '6px' },
  btnDel: { background: 'none', border: '1px solid #A32D2D', color: '#A32D2D', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  empty: { textAlign: 'center', color: '#aaa', padding: '30px' }
};

export default Parametres;