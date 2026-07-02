import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

// Avant d'afficher l'application, on récupère les préférences utilisateur
// enregistrées dans le navigateur pour réappliquer le thème choisi.
const savedColor = localStorage.getItem('themeColor');
if (savedColor) {
  document.documentElement.style.setProperty('--primary-color', savedColor);
}

// On restaure aussi le mode clair ou sombre stocké précédemment.
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Démarrage de l'application React dans le DOM.
// BrowserRouter permet la navigation sans rechargement de page.
// AppProvider fournit les données globales à toute l'application.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);