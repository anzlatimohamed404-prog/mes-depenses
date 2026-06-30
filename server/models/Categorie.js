const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Categorie = sequelize.define('Categorie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icone: {
    type: DataTypes.STRING,
    defaultValue: '📦',
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Categorie;