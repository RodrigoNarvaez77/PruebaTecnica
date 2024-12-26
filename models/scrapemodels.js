const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Conexión a la base de datos

// Modelo de la tabla Scrape
const Scrape = sequelize.define('Scrape', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true // SQLite autoincrement
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  scraped_at: {
    type: DataTypes.DATE,
    allowNull: false 
  },
  data: {
    type: DataTypes.TEXT, // almacenar datos.
    allowNull: false 
  }
}, {
  tableName: 'scrape', // Nombre exacto de la tabla.
  timestamps: false     
});

module.exports = Scrape;
