import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', form);
      navigate('/login');
    } catch (error) {
      setErreur('Erreur lors de la création du compte');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💸 Mes Dépenses</h1>
        <h2 style={styles.subtitle}>Créer un compte</h2>
        {erreur && <p style={styles.erreur}>{erreur}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" placeholder="Nom"
            value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
          <input style={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Mot de passe"
            value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} required />
          <button style={styles.btn} type="submit">S'inscrire</button>
        </form>
        <p style={styles.link}>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
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

export default Register;