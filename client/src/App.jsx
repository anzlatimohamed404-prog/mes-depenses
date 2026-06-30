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

const PrivateRoute = ({ children }) => {
  const { token } = useApp();
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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