import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

// Appliquer la couleur du thème sauvegardée avant le rendu
const savedColor = localStorage.getItem('themeColor');
if (savedColor) {
  document.documentElement.style.setProperty('--primary-color', savedColor);
}

// Appliquer le mode sombre/clair sauvegardé
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);