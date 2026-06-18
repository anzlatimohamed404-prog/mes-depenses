const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TauxChange = sequelize.define('TauxChange', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pays: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  devise: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taux: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'taux_change',
  timestamps: true,
});

module.exports = TauxChange;