import axios from 'axios';

// Base URL configurable : en local, on utilise le backend local
// pour éviter les erreurs CORS et les déploiements distants non disponibles.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL,
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