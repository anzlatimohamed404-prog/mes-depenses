import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [operations, setOperations] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [taux, setTaux] = useState([]);
  const [stats, setStats] = useState({ total: 0, mois: 0, nb_operations: 0 });

  useEffect(() => {
    if (token) {
      fetchBeneficiaires();
      fetchOperations();
      fetchStats();
      fetchTaux();
    }
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOperations([]);
    setBeneficiaires([]);
  };

  const fetchBeneficiaires = async () => {
    try {
      const res = await axios.get('/beneficiaires');
      setBeneficiaires(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOperations = async (params = {}) => {
    try {
      const res = await axios.get('/operations', { params });
      setOperations(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/operations/stats');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTaux = async () => {
    try {
      const res = await axios.get('/taux-change');
      setTaux(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppContext.Provider value={{
      user, token, operations, beneficiaires, taux, stats,
      login, logout,
      fetchBeneficiaires, fetchOperations, fetchStats, fetchTaux
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);