const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Modèle représentant une opération financière enregistrée par l'utilisateur.
const Operation = sequelize.define('Operation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'autre',
  },
  montant_eur: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  montant_devise: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  devise: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_envoi: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  beneficiaire_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'operations',
  timestamps: true,
});

module.exports = Operation;