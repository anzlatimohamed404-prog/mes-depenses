import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

// Création du contexte global de l'application
const AppContext = createContext();

// Fournisseur du contexte qui encapsule toute l'application
export const AppProvider = ({ children }) => {

  // Informations de l'utilisateur connecté
  const [user, setUser] = useState(null);

  // Récupération du token enregistré dans le navigateur
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Liste des opérations financières
  const [operations, setOperations] = useState([]);

  // Liste des bénéficiaires
  const [beneficiaires, setBeneficiaires] = useState([]);

  // Liste des taux de change
  const [taux, setTaux] = useState([]);

  // Liste des catégories
  const [categories, setCategories] = useState([]);

  // Statistiques affichées sur le tableau de bord
  const [stats, setStats] = useState({
    total: 0,
    mois: 0,
    nb_operations: 0
  });

  // Dès qu'un utilisateur possède un token,
  // on récupère toutes les données nécessaires
  useEffect(() => {
    if (token) {
      fetchBeneficiaires();
      fetchOperations();
      fetchStats();
      fetchTaux();
      fetchCategories();
      fetchProfile();
    }
  }, [token]);

  // Connexion de l'utilisateur
  const login = (userData, userToken) => {
    // Sauvegarde du token dans le navigateur
    localStorage.setItem('token', userToken);

    // Mise à jour des états
    setToken(userToken);
    setUser(userData);
  };

  // Déconnexion de l'utilisateur
  const logout = () => {
    // Suppression du token
    localStorage.removeItem('token');

    // Réinitialisation des données
    setToken(null);
    setUser(null);
    setOperations([]);
    setBeneficiaires([]);
  };

  // Récupération de tous les bénéficiaires
  const fetchBeneficiaires = async () => {
    try {
      const res = await axios.get('/beneficiaires');
      setBeneficiaires(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Récupération des opérations
  // Les paramètres permettent de filtrer les résultats
  const fetchOperations = async (params = {}) => {
    try {
      const res = await axios.get('/operations', { params });
      setOperations(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Récupération des statistiques globales
  const fetchStats = async () => {
    try {
      const res = await axios.get('/operations/stats');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Récupération des taux de change
  const fetchTaux = async () => {
    try {
      const res = await axios.get('/taux-change');
      setTaux(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Récupération des informations du profil connecté
  const fetchProfile = async () => {
    try {
      const res = await axios.get('/auth/profile');
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Mise à jour des informations du profil
  const updateProfile = async (data) => {
    const res = await axios.put('/auth/profile', data);

    // Mise à jour de l'utilisateur dans le contexte
    setUser(res.data.utilisateur);

    return res.data;
  };

  // Modification du mot de passe
  const changePassword = async (data) => {
    const res = await axios.put('/auth/password', data);
    return res.data;
  };

  // Mise à disposition des données et fonctions
  // pour tous les composants de l'application
  return (
    <AppContext.Provider
      value={{
        user,
        token,
        operations,
        beneficiaires,
        taux,
        stats,
        categories,

        login,
        logout,
        updateProfile,
        changePassword,
        fetchProfile,
        fetchBeneficiaires,
        fetchOperations,
        fetchStats,
        fetchTaux,
        fetchCategories
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé permettant d'accéder facilement au contexte
export const useApp = () => useContext(AppContext);