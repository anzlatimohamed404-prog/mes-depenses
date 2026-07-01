import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      login(res.data.utilisateur, res.data.token);
      navigate('/');
    } catch (error) {
      setErreur('Email ou mot de passe incorrect');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💸 Mes Dépenses</h1>
        <h2 style={styles.subtitle}>Connexion</h2>
        {erreur && <p style={styles.erreur}>{erreur}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Mot de passe"
            value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} required />
          <button style={styles.btn} type="submit">Se connecter</button>
        </form>
        <p style={styles.link}>Pas de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C447C', padding: '16px' },
  card: { background: 'white', padding: '32px 24px', borderRadius: '16px', width: '100%', maxWidth: '360px', boxSizing: 'border-box' },
  title: { textAlign: 'center', color: '#0C447C', marginBottom: '4px', fontSize: '24px', lineHeight: '1.2' },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: '24px', fontSize: '16px', marginTop: '4px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#0C447C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  erreur: { color: 'red', fontSize: '13px', marginBottom: '10px' },
  link: { textAlign: 'center', marginTop: '16px', fontSize: '13px' }
};

export default Login;