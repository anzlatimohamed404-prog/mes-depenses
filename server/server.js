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

// Origines autorisées pour les requêtes CORS.
// Pour la production, ajouter l'URL du front déployé dans ALLOWED_ORIGINS si nécessaire.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'https://mes-depenses-production.up.railway.app'
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes provenant du navigateur ou sans origine (ex: tests API).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin non autorisée par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Middleware CORS global, puis activation des réponses aux préflights OPTIONS.
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// Démarrage du serveur sur le port défini ou par défaut 5000.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

