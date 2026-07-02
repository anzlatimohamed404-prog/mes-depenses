const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Modèle représentant un bénéficiaire lié à un utilisateur.
const Beneficiaire = sequelize.define('Beneficiaire', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pays: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  devise: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  relation: {
    type: DataTypes.ENUM('famille', 'ami', 'autre'),
    defaultValue: 'autre',
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'beneficiaires',
  timestamps: true,
});

module.exports = Beneficiaire;