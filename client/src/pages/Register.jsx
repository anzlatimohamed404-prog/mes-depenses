import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value || '');

// Page d'inscription du projet.
// Elle permet à un nouvel utilisateur de créer un compte pour accéder à l'application.
const Register = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  // Envoie les informations du nouvel utilisateur vers l'API pour création du compte.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    const nom = form.nom.trim();
    const email = form.email.trim();
    const password = form.mot_de_passe;

    if (!nom || !email || !password) {
      setErreur('Tous les champs sont requis.');
      return;
    }

    if (!isValidEmail(email)) {
      setErreur('Veuillez saisir un email valide.');
      return;
    }

    if (password.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/register', { nom, email, mot_de_passe: password });
      login(res.data.utilisateur, res.data.token);
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de la création du compte';
      setErreur(message === 'Network Error' ? 'Impossible de joindre le serveur' : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">💸 Mes Dépenses</h1>
        <p className="auth-subtitle">Créer un compte</p>
        {erreur && <p className="error-text">{erreur}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Nom"
            value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })}
            required
          />
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
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>
        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;