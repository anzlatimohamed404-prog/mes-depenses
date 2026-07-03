import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value || '');

// Page de connexion du projet.
// Elle permet à l'utilisateur d'entrer ses identifiants et d'obtenir un accès sécurisé.
const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Envoie les identifiants au backend et connecte l'utilisateur si les informations sont valides.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setMessage('');

    const email = form.email.trim();
    const password = form.mot_de_passe;

    if (!email || !password) {
      setErreur('Veuillez remplir tous les champs.');
      return;
    }

    if (!isValidEmail(email)) {
      setErreur('Veuillez saisir un email valide.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, mot_de_passe: password });
      login(res.data.utilisateur, res.data.token);
      setMessage('Connexion réussie. Redirection...');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      setErreur(message === 'Network Error' ? 'Impossible de joindre le serveur' : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">💸 Mes Dépenses</h1>
        <p className="auth-subtitle">Connexion</p>
        {erreur && <p className="error-text">{erreur}</p>}
        {message && <p style={{ color: '#0f766e', marginBottom: '12px', textAlign: 'center' }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Mot de passe"
            value={form.mot_de_passe}
            onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
            required
          />
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-link" style={{ marginTop: '8px' }}>
          Mot de passe oublié ?
        </p>
        <p className="auth-link">
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;