import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { logout, user } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>💸 Mes Dépenses</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Accueil</Link>
        <Link to="/operations" style={styles.link}>Opérations</Link>
        <Link to="/beneficiaires" style={styles.link}>Liste des dépenses</Link>
        <Link to="/parametres" style={styles.link}>Paramètres</Link>
      </div>
      <button onClick={handleLogout} style={styles.btn}>Déconnexion</button>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'var(--primary-color)', color: 'white' },
  logo: { fontSize: '18px', fontWeight: '700' },
  links: { display: 'flex', gap: '24px' },
  link: { color: 'white', textDecoration: 'none', fontSize: '14px' },
  btn: { background: 'transparent', border: '1px solid white', color: 'white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }
};

export default Navbar;