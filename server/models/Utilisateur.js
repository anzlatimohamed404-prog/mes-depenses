const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Modèle représentant un utilisateur de l'application.
const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
}, {
  tableName: 'utilisateurs',
  timestamps: true,
});

module.exports = Utilisateur;