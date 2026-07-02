import axios from 'axios';

// Création d'une instance Axios personnalisée pour centraliser toutes les requêtes HTTP.
// Cela simplifie la communication avec l'API backend du projet.
const instance = axios.create({
  baseURL: 'https://mes-depenses-production.up.railway.app/api',
});

// Intercepteur qui ajoute automatiquement le token JWT à chaque requête.
// Cela permet d'authentifier l'utilisateur sans répéter cette logique partout.
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;        