const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, sequelize } = require('./config/db');
require('./models/index');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/beneficiaires', require('./routes/beneficiaireRoutes'));
app.use('/api/operations', require('./routes/operationRoutes'));
app.use('/api/taux-change', require('./routes/tauxChangeRoutes'));
app.use('/api/categories', require('./routes/categorieRoutes'));
connectDB();

sequelize.sync({ alter: true }).then(() => {
  console.log('Tables synchronisées !');
});

app.get('/', (req, res) => {
  res.json({ message: 'Mes Dépenses API fonctionne !' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

