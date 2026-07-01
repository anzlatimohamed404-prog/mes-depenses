import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from '../utils/axios';

const palette = ['#0C447C', '#A32D2D', '#1E7A4D', '#7B2D9E', '#C77B0C', '#2D5A8C'];

const Parametres = () => {
  const { taux, fetchTaux, categories, fetchCategories, operations, fetchOperations, updateProfile, changePassword, user } = useApp();
  const [form, setForm] = useState({ pays: '', devise: '', taux: '' });
  const [showForm, setShowForm] = useState(false);

  const [catForm, setCatForm] = useState({ nom: '', icone: '📦' });
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editNom, setEditNom] = useState('');
  const [fusionSource, setFusionSource] = useState('');
  const [fusionCible, setFusionCible] = useState('');

  const [couleur, setCouleur] = useState(localStorage.getItem('themeColor') || palette[0]);

  const [profilForm, setProfilForm] = useState({ nom: '', email: '' });
  const [pwdForm, setPwdForm] = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '' });
  const [msgProfil, setMsgProfil] = useState('');
  const [msgPwd, setMsgPwd] = useState('');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', couleur);
  }, []);

  useEffect(() => {
    if (user) {
      setProfilForm({ nom: user.nom || '', email: user.email || '' });
    }
  }, [user]);

  const handleChangerCouleur = () => {
    const indexActuel = palette.indexOf(couleur);
    const prochaine = palette[(indexActuel + 1) % palette.length];
    setCouleur(prochaine);
    localStorage.setItem('themeColor', prochaine);
    document.documentElement.style.setProperty('--primary-color', prochaine);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsgProfil('');
    try {
      await updateProfile(profilForm);
      setMsgProfil('✓ Profil mis à jour');
    } catch (error) {
      setMsgProfil(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsgPwd('');
    try {
      await changePassword(pwdForm);
      setMsgPwd('✓ Mot de passe modifié');
      setPwdForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '' });
    } catch (error) {
      setMsgPwd(error.response?.data?.message || 'Erreur lors du changement');
    }
  };

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

  const getTotalCategorie = (nom) => {
    return operations.filter(o => o.categorie === nom).reduce((s, o) => s + o.montant_eur, 0);
  };

  const getNbOperations = (nom) => {
    return operations.filter(o => o.categorie === nom).length;
  };

  const handleAddCategorie = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/categories', catForm);
      fetchCategories();
      setCatForm({ nom: '', icone: '📦' });
      setShowCatForm(false);
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const startEditCat = (cat) => {
    setEditingCat(cat.id);
    setEditNom(cat.nom);
  };

  const saveEditCat = async (id) => {
    try {
      await axios.put(`/categories/${id}`, { nom: editNom });
      fetchCategories();
      fetchOperations();
      setEditingCat(null);
    } catch (error) {
      alert('Erreur lors de la modification');
    }
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await axios.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleFusionner = async () => {
    if (!fusionSource || !fusionCible || fusionSource === fusionCible) {
      alert('Choisis deux catégories différentes');
      return;
    }
    if (!window.confirm('Fusionner ces deux catégories ?')) return;
    try {
      await axios.post('/categories/fusionner', {
        categorieSourceId: fusionSource,
        categorieCibleId: fusionCible
      });
      fetchCategories();
      fetchOperations();
      setFusionSource('');
      setFusionCible('');
    } catch (error) {
      alert('Erreur lors de la fusion');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Paramètres</h1>

      {/* SECTION THÈME */}
      <div style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎨 Couleur de l'application</h2>
        </div>
        <div style={styles.formCard}>
          <button onClick={handleChangerCouleur} style={{...styles.btnAdd, background: couleur}}>
            🎨 Changer la couleur
          </button>
        </div>
      </div>

      {/* SECTION PROFIL */}
      <div style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.title}>👤 Mon profil</h2>
        </div>
        <div style={styles.formCard}>
          <form onSubmit={handleUpdateProfile}>
            <div className="params-form-grid-2">
              <div>
                <label style={styles.label}>Nom</label>
                <input style={styles.input} type="text" value={profilForm.nom}
                  onChange={e => setProfilForm({...profilForm, nom: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" value={profilForm.email}
                  onChange={e => setProfilForm({...profilForm, email: e.target.value})} required />
              </div>
            </div>
            <button style={{...styles.btnSubmit, marginTop: '16px', width: '100%'}} type="submit">Mettre à jour</button>
            {msgProfil && <p style={{marginTop: '10px', fontSize: '13px', color: '#333'}}>{msgProfil}</p>}
          </form>
        </div>

        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword}>
            <div className="params-form-grid-2">
              <div>
                <label style={styles.label}>Ancien mot de passe</label>
                <input style={styles.input} type="password" value={pwdForm.ancien_mot_de_passe}
                  onChange={e => setPwdForm({...pwdForm, ancien_mot_de_passe: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Nouveau mot de passe</label>
                <input style={styles.input} type="password" value={pwdForm.nouveau_mot_de_passe}
                  onChange={e => setPwdForm({...pwdForm, nouveau_mot_de_passe: e.target.value})} required />
              </div>
            </div>
            <button style={{...styles.btnSubmit, marginTop: '16px', width: '100%'}} type="submit">Changer le mot de passe</button>
            {msgPwd && <p style={{marginTop: '10px', fontSize: '13px', color: '#333'}}>{msgPwd}</p>}
          </form>
        </div>
      </div>

      {/* SECTION CATÉGORIES */}
      <div style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.title}>📂 Gestion des catégories</h2>
          <button onClick={() => setShowCatForm(!showCatForm)} style={styles.btnAdd}>
            {showCatForm ? '✕' : '+ Catégorie'}
          </button>
        </div>

        {showCatForm && (
          <div style={styles.formCard}>
            <form onSubmit={handleAddCategorie} style={styles.inlineForm}>
              <input style={styles.input} type="text" placeholder="Ex: Vêtements"
                value={catForm.nom} onChange={e => setCatForm({...catForm, nom: e.target.value})} required />
              <input style={{...styles.input, width: '70px', flexShrink: 0}} type="text" placeholder="📦"
                value={catForm.icone} onChange={e => setCatForm({...catForm, icone: e.target.value})} />
              <button style={styles.btnSubmit} type="submit">Ajouter</button>
            </form>
          </div>
        )}

        <div style={styles.list}>
          {categories.map(cat => (
            <div key={cat.id} style={styles.catItem}>
              <div style={styles.catLeft}>
                <span style={styles.catIcon}>{cat.icone}</span>
                {editingCat === cat.id ? (
                  <input style={styles.editInput} type="text" value={editNom}
                    onChange={e => setEditNom(e.target.value)} autoFocus />
                ) : (
                  <div>
                    <p style={styles.catNom}>{cat.nom}</p>
                    <p style={styles.catSub}>{getNbOperations(cat.nom)} op. — {getTotalCategorie(cat.nom).toFixed(2)} €</p>
                  </div>
                )}
              </div>
              <div style={styles.catActions}>
                {editingCat === cat.id ? (
                  <>
                    <button onClick={() => saveEditCat(cat.id)} style={styles.btnSave}>✓</button>
                    <button onClick={() => setEditingCat(null)} style={styles.btnCancel}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditCat(cat)} style={styles.btnEdit}>✏️</button>
                    <button onClick={() => handleDeleteCat(cat.id)} style={styles.btnDel}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && <p style={styles.empty}>Aucune catégorie personnalisée.</p>}
        </div>

        {categories.length >= 2 && (
          <div style={styles.fusionBox}>
            <p style={styles.fusionTitle}>🔀 Fusionner deux catégories</p>
            <div className="params-fusion-row">
              <select style={styles.input} value={fusionSource} onChange={e => setFusionSource(e.target.value)}>
                <option value="">Catégorie à fusionner...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
              </select>
              <span style={{padding: '0 4px', flexShrink: 0}}>→</span>
              <select style={styles.input} value={fusionCible} onChange={e => setFusionCible(e.target.value)}>
                <option value="">vers cette catégorie...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
              </select>
              <button onClick={handleFusionner} style={styles.btnSubmit}>Fusionner</button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION TAUX DE CHANGE */}
      <div style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.title}>💱 Taux de change</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
            {showForm ? '✕' : '+ Taux'}
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Nouveau taux de change</h2>
            <form onSubmit={handleSubmit}>
              <div className="params-form-grid-3">
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
                  <label style={styles.label}>Taux (1 € = X)</label>
                  <input style={styles.input} type="number" placeholder="Ex: 491.96" step="0.01"
                    value={form.taux} onChange={e => setForm({...form, taux: e.target.value})} required />
                </div>
              </div>
              <button style={{...styles.btnSubmit, marginTop: '16px', width: '100%'}} type="submit">Enregistrer</button>
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
              <p style={{fontSize:'13px', marginTop:'8px'}}>Exemple : 1 € = 491.96 KMF</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '16px', maxWidth: '900px', margin: '0 auto' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '24px' },
  section: { marginBottom: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' },
  title: { fontSize: '18px', fontWeight: '700', color: 'var(--primary-color)' },
  btnAdd: { background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  formCard: { background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' },
  inlineForm: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  label: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  btnSubmit: { padding: '9px 18px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  list: { background: 'white', borderRadius: '12px', padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  catItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  catLeft: { display: 'flex', gap: '12px', alignItems: 'center', flex: 1 },
  catIcon: { fontSize: '22px', flexShrink: 0 },
  catNom: { fontSize: '14px', fontWeight: '600', color: '#333' },
  catSub: { fontSize: '12px', color: '#888' },
  catActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editInput: { padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--primary-color)', fontSize: '14px', width: '100%' },
  btnEdit: { background: '#E6F1FB', color: 'var(--primary-color)', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  btnSave: { background: 'var(--primary-color)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnCancel: { background: 'none', border: '1px solid #ddd', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  fusionBox: { background: 'white', borderRadius: '12px', padding: '16px', marginTop: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  fusionTitle: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' },
  tauxItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' },
  tauxPays: { fontSize: '15px', fontWeight: '600', color: '#333' },
  tauxDevise: { fontSize: '12px', color: '#888' },
  tauxRight: { textAlign: 'right' },
  tauxValeur: { fontSize: '14px', fontWeight: '600', color: 'var(--primary-color)', marginBottom: '6px' },
  btnDel: { background: 'none', border: '1px solid #A32D2D', color: '#A32D2D', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  empty: { textAlign: 'center', color: '#aaa', padding: '20px' }
};

export default Parametres;