import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { stats, operations, beneficiaires, fetchStats, fetchOperations } = useApp();

  useEffect(() => {
    fetchStats();
    fetchOperations();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tableau de bord</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.label}>Total envoyé</p>
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

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Dernières opérations</h2>
          <Link to="/operations" style={styles.seeAll}>Voir tout</Link>
        </div>
        {operations.slice(0, 5).map(op => (
          <div key={op.id} style={styles.opItem}>
            <div>
              <p style={styles.opNom}>{op.Beneficiaire?.nom}</p>
              <p style={styles.opDate}>{op.date_envoi} — {op.Beneficiaire?.pays}</p>
              {op.note && <p style={styles.opNote}>{op.note}</p>}
            </div>
            <div style={styles.opRight}>
              <p style={styles.opMontant}>-{op.montant_eur?.toFixed(2)} €</p>
              <p style={styles.opDevise}>{op.montant_devise?.toFixed(2)} {op.devise}</p>
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
  title: { fontSize: '22px', fontWeight: '700', color: '#0C447C', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  card: { background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  label: { fontSize: '12px', color: '#888', marginBottom: '6px' },
  value: { fontSize: '22px', fontWeight: '700', color: '#0C447C' },
  section: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#333' },
  seeAll: { fontSize: '13px', color: '#0C447C' },
  opItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  opNom: { fontSize: '14px', fontWeight: '600', color: '#333' },
  opDate: { fontSize: '12px', color: '#888' },
  opNote: { fontSize: '12px', color: '#aaa' },
  opRight: { textAlign: 'right' },
  opMontant: { fontSize: '15px', fontWeight: '700', color: '#A32D2D' },
  opDevise: { fontSize: '12px', color: '#888' },
  empty: { textAlign: 'center', color: '#aaa', padding: '20px' }
};

export default Dashboard;