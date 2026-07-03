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
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">💸</span>
        <span className="navbar-logo-text">Mes Dépenses</span>
      </Link>

      <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕ Fermer' : '☰ Menu'}
      </button>

      <div className="navbar-links">
        <Link to="/" className="navbar-link">Accueil</Link>
        <Link to="/operations" className="navbar-link">Opérations</Link>
        <Link to="/beneficiaires" className="navbar-link">Liste des dépenses</Link>
        <Link to="/parametres" className="navbar-link">Paramètres</Link>
        <button onClick={handleLogout} className="navbar-btn">Déconnexion</button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>🏠 Accueil</Link>
          <Link to="/operations" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>💳 Opérations</Link>
          <Link to="/beneficiaires" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>📋 Liste des dépenses</Link>
          <Link to="/parametres" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>⚙️ Paramètres</Link>
          <button onClick={handleLogout} className="navbar-btn" style={{margin: '12px 24px'}}>Déconnexion</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;