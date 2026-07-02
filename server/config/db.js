const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialisation de Sequelize avec les informations de connexion à MySQL.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

// Fonction de connexion à la base de données.
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL réussie !');
  } catch (error) {
    console.error('Erreur de connexion MySQL :', error);
  }
};

module.exports = { sequelize, connectDB };