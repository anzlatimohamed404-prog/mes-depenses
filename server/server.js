const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Chargement des variables d'environnement depuis le fichier .env.
dotenv.config();

// Importation de la configuration de la base de données et des modèles Sequelize.
const { connectDB, sequelize } = require('./config/db');
require('./models/index');

// Création de l'application Express.
const app = express();

// Configuration CORS globale et explicite pour toutes les origines.
// Cela garantit que les requêtes préflight OPTIONS reçoivent bien
// les en-têtes nécessaires lors de l'appel depuis localhost:5173.
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Middleware pour lire les données JSON envoyées par le client.
app.use(express.json());

// Déclaration des routes de l'API selon les différentes fonctionnalités.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/beneficiaires', require('./routes/beneficiaireRoutes'));
app.use('/api/operations', require('./routes/operationRoutes'));
app.use('/api/taux-change', require('./routes/tauxChangeRoutes'));
app.use('/api/categories', require('./routes/categorieRoutes'));

// Connexion à la base de données MySQL.
connectDB();

// Synchronisation des tables avec la base de données au démarrage.
sequelize.sync({ alter: true }).then(() => {
  console.log('Tables synchronisées !');
});

// Route de test pour vérifier que l'API fonctionne.
app.get('/', (req, res) => {
  res.json({ message: 'Mes Dépenses API fonctionne !' });
});

// Endpoint simple pour vérifier l'accessibilité depuis un autre appareil.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrage du serveur sur le port défini ou par défaut 5000.
// L'hôte 0.0.0.0 permet au serveur d'être atteint depuis un autre appareil
// sur le même réseau local, par exemple depuis un téléphone.
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT} sur 0.0.0.0`);
});

