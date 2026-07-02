import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const Dashboard = () => {
  const { user, stats, operations, beneficiaires, taux, fetchStats, fetchOperations } = useApp();

  const [showQuickForm, setShowQuickForm] = useState(false);
  const [showAllRecentOps, setShowAllRecentOps] = useState(false);
  const [selectedBeneId, setSelectedBeneId] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [montantDevise, setMontantDevise] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchOperations();
  }, []);

  useEffect(() => {
    if (selectedBeneId && montant) {
      const bene = beneficiaires.find(b => b.id == selectedBeneId);
      const tauxBene = taux.find(t => t.devise === bene?.devise);
      if (tauxBene) {
        setMontantDevise((parseFloat(montant) * tauxBene.taux).toFixed(2));
      } else {
        setMontantDevise(0);
      }
    } else {
      setMontantDevise(0);
    }
  }, [selectedBeneId, montant]);

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    const bene = beneficiaires.find(b => b.id == selectedBeneId);
    const tauxBene = taux.find(t => t.devise === bene?.devise);
    try {
      await axios.post('/operations', {
        categorie: selectedBeneId ? 'virement' : 'depense',
        beneficiaire_id: selectedBeneId || null,
        montant_eur: montant,
        date_envoi: date,
        note: note,
        montant_devise: montantDevise || null,
        devise: bene?.devise || null,
        taux_applique: tauxBene?.taux || 1
      });
      fetchStats();
      fetchOperations();
      setShowQuickForm(false);
      setSelectedBeneId('');
      setMontant('');
      setNote('');
      setMontantDevise(0);
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const userName = user?.nom || user?.email || 'Utilisateur';
  const visibleRecentOperations = showAllRecentOps ? operations : operations.slice(0, 3);

  return (
    <div style={styles.container}>
      <div style={styles.heroCard}>
        <div>
          <p style={styles.eyebrow}>Accueil</p>
          <h1 style={styles.title}>Bonjour, {userName}</h1>
          <p style={styles.subtitle}>Voici un aperçu rapide de vos dépenses et opérations récentes.</p>
        </div>
        <div style={styles.avatarBadge}>{userName?.charAt(0)?.toUpperCase() || 'U'}</div>
      </div>

      {/* STATS */}
      <div className="dashboard-grid">
        <div style={styles.card}>
          <p style={styles.label}>Total Dépensé</p>
          <p style={styles.value}>{stats.total?.toFixed(2)} €</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Ce mois-ci</p>
          <p style={styles.value}>{stats.mois?.toFixed(2)} €</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Opérations</p>
          <p style={styles.value}>{stats.nb_operations}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Bénéficiaires</p>
          <p style={styles.value}>{beneficiaires.length}</p>
        </div>
      </div>

      {/* DERNIÈRES OPÉRATIONS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Dernières opérations</h2>
          <Link to="/operations" style={styles.seeAll}>Voir tout</Link>
        </div>
        {visibleRecentOperations.map(op => (
          <div key={op.id} style={styles.opItem}>
            <div>
              <p style={styles.opNom}>{op.Beneficiaire?.nom || op.categorie}</p>
              <p style={styles.opDate}>
                {op.date_envoi}{op.Beneficiaire?.pays ? ` — ${op.Beneficiaire.pays}` : ''}
              </p>
              {op.note && <p style={styles.opNote}>{op.note}</p>}
            </div>
            <div style={styles.opRight}>
              <p style={styles.opMontant}>+{op.montant_eur?.toFixed(2)} €</p>
              {op.montant_devise && (
                <p style={styles.opDevise}>{op.montant_devise?.toFixed(2)} {op.devise}</p>
              )}
            </div>
          </div>
        ))}
        {operations.length > 3 && (
          <button onClick={() => setShowAllRecentOps(!showAllRecentOps)} style={styles.showMoreBtn}>
            {showAllRecentOps ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
        {operations.length === 0 && <p style={styles.empty}>Aucune opération</p>}
      </div>

      {/* FORMULAIRE RAPIDE */}
      {showQuickForm && (
        <div style={styles.quickFormOverlay} onClick={() => setShowQuickForm(false)}>
          <div style={styles.quickForm} onClick={e => e.stopPropagation()}>
            <div style={styles.quickFormHeader}>
              <h2 style={styles.quickFormTitle}>⚡ Nouvelle opération rapide</h2>
              <button onClick={() => setShowQuickForm(false)} style={styles.btnClose}>✕</button>
            </div>
            <form onSubmit={handleQuickSubmit}>
              <div style={{marginBottom: '12px'}}>
                <label style={styles.label}>Bénéficiaire (optionnel)</label>
                <select style={styles.input} value={selectedBeneId}
                  onChange={e => setSelectedBeneId(e.target.value)}>
                  <option value="">Aucun (dépense directe)</option>
                  {beneficiaires.map(b => (
                    <option key={b.id} value={b.id}>{b.nom} — {b.pays}</option>
                  ))}
                </select>
              </div>
              <div style={{marginBottom: '12px'}}>
                <label style={styles.label}>Montant (€)</label>
                <input style={styles.input} type="number" placeholder="0.00" step="0.01"
                  value={montant} onChange={e => setMontant(e.target.value)} required />
              </div>
              <div style={{marginBottom: '12px'}}>
                <label style={styles.label}>Date</label>
                <input style={styles.input} type="date"
                  value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div style={{marginBottom: '12px'}}>
                <label style={styles.label}>Note</label>
                <input style={styles.input} type="text" placeholder="Optionnel..."
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
              {montantDevise > 0 && (
                <div style={styles.conversion}>
                  <p style={styles.label}>Le bénéficiaire reçoit :</p>
                  <p style={styles.conversionValue}>
                    {montantDevise} {beneficiaires.find(b => b.id == selectedBeneId)?.devise}
                  </p>
                </div>
              )}
              <button style={styles.btnSubmit} type="submit">✓ Enregistrer</button>
            </form>
          </div>
        </div>
      )}

      <button
  onClick={() => setShowQuickForm(!showQuickForm)}
  style={styles.btnFlottant}
>
  {showQuickForm ? '✕ Fermer' : '+ Faire une opération'}
</button>
    </div>
  );
};

const styles = {
  container: { padding: '16px', maxWidth: '900px', margin: '0 auto' },
  heroCard: {
    background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)',
    color: 'white',
    borderRadius: '18px',
    padding: '20px 22px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 16px 36px rgba(37, 99, 235, 0.2)'
  },
  eyebrow: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.8, marginBottom: '6px' },
  title: { fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  subtitle: { fontSize: '14px', opacity: 0.9, lineHeight: 1.5 },
  avatarBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    flexShrink: 0
  },
  card: { background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow)' },
  label: { fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' },
  value: { fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' },
  section: { background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow)', marginBottom: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text)' },
  seeAll: { fontSize: '13px', color: 'var(--primary-color)' },
  opItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' },
  opNom: { fontSize: '14px', fontWeight: '600', color: 'var(--text)' },
  opDate: { fontSize: '12px', color: 'var(--text-secondary)' },
  opNote: { fontSize: '12px', color: 'var(--text-secondary)' },
  opRight: { textAlign: 'right', flexShrink: 0, marginLeft: '8px' },
  opMontant: { fontSize: '15px', fontWeight: '700', color: 'var(--primary-color)' },
  opDevise: { fontSize: '12px', color: 'var(--text-secondary)' },
  showMoreBtn: { marginTop: '10px', width: '100%', padding: '10px 12px', background: 'var(--primary-soft)', color: 'var(--primary-color)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  empty: { textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' },
  quickFormOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 998,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    padding: '16px'
  },
  quickForm: {
    background: 'var(--bg-card)', borderRadius: '16px 16px 0 0',
    padding: '24px', width: '100%', maxWidth: '500px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
    maxHeight: '90vh', overflowY: 'auto'
  },
  quickFormHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  quickFormTitle: { fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)' },
  btnClose: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box', background: 'var(--input-bg)', color: 'var(--text)' },
  btnSubmit: { marginTop: '8px', width: '100%', padding: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  conversion: { background: '#E6F1FB', borderRadius: '8px', padding: '10px', marginBottom: '12px' },
  conversionValue: { fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)' },
  btnFlottant: {
  position: 'fixed', bottom: '30px', right: '30px',
  background: 'var(--primary-color)', color: 'white',
  border: 'none', fontSize: '15px', fontWeight: '600',
  cursor: 'pointer', padding: '14px 20px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  display: 'flex', alignItems: 'center', gap: '8px',
  zIndex: 999, borderRadius: '30px'
},

};

export default Dashboard;