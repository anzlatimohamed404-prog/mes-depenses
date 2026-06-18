const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Operation = sequelize.define('Operation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  montant_eur: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  montant_devise: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  devise: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frais: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
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
    allowNull: false,
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