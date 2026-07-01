import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { logout } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>💸 Mes Dépenses</div>

      <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className="navbar-links">
        <Link to="/" style={styles.link}>Accueil</Link>
        <Link to="/operations" style={styles.link}>Opérations</Link>
        <Link to="/beneficiaires" style={styles.link}>Liste des dépenses</Link>
        <Link to="/parametres" style={styles.link}>Paramètres</Link>
        <button onClick={handleLogout} style={styles.btn}>Déconnexion</button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🏠 Accueil</Link>
          <Link to="/operations" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>💳 Opérations</Link>
          <Link to="/beneficiaires" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📋 Liste des dépenses</Link>
          <Link to="/parametres" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>⚙️ Paramètres</Link>
          <button onClick={handleLogout} style={styles.mobileBtnLogout}>Déconnexion</button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'var(--primary-color)', color: 'white', position: 'relative', flexWrap: 'wrap' },
  logo: { fontSize: '18px', fontWeight: '700', color: 'white' },
  link: { color: 'white', textDecoration: 'none', fontSize: '14px' },
  btn: { background: 'transparent', border: '1px solid white', color: 'white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  mobileMenu: { display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--primary-color)', paddingBottom: '8px' },
  mobileLink: { color: 'white', textDecoration: 'none', padding: '12px 24px', fontSize: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'block' },
  mobileBtnLogout: { background: 'transparent', border: 'none', color: 'white', padding: '12px 24px', fontSize: '15px', cursor: 'pointer', textAlign: 'left', width: '100%' }
};

export default Navbar;