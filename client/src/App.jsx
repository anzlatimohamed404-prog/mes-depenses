import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import Beneficiaires from './pages/Beneficiaires';
import Parametres from './pages/Parametres';
import Navbar from './components/Navbar';

// Ce composant protège les pages sensibles : si l'utilisateur n'est pas connecté,
// il est automatiquement redirigé vers la page de connexion.
const PrivateRoute = ({ children }) => {
  const { token } = useApp();
  return token ? children : <Navigate to="/login" />;
};

// Point d'entrée principal de l'application React.
// Il définit la navigation entre les différentes pages du projet.
const App = () => {
  return (
    <Routes>
      {/* Page de connexion accessible sans authentification */}
      <Route path="/login" element={<Login />} />
      {/* Page d'inscription accessible sans authentification */}
      <Route path="/register" element={<Register />} />
      {/* Page d'accueil protégée : seule une personne connectée peut y accéder */}
      <Route path="/" element={
        <PrivateRoute>
          <Navbar />
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/operations" element={
        <PrivateRoute>
          <Navbar />
          <Operations />
        </PrivateRoute>
      } />
      <Route path="/beneficiaires" element={
        <PrivateRoute>
          <Navbar />
          <Beneficiaires />
        </PrivateRoute>
      } />
      <Route path="/parametres" element={
        <PrivateRoute>
          <Navbar />
          <Parametres />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default App;