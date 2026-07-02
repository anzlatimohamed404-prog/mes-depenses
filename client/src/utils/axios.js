import axios from 'axios';

// Base URL configurable : en dev on utilise le backend local, en prod on peut
// injecter l'URL via la variable d'environnement VITE_API_URL.
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