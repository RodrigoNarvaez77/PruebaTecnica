const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Configuración de Sequelize

const TextProcessing = sequelize.define('process', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  headline: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  sentiment: {
    type: DataTypes.STRING,
    allowNull: true, // Puede ser NULL si no se realiza análisis de sentimiento
  },
  score: {
    type: DataTypes.DECIMAL(5, 2), // Precisión para valores decimales
    allowNull: true, // Puede ser NULL si no se realiza análisis de sentimiento
  },
  summary: {
    type: DataTypes.TEXT, // Campo opcional para almacenar el resumen
    allowNull: true,      // Puede ser NULL si no se realiza resumen
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Valor predeterminado para la fecha.
  },
}, {
  tableName: 'process', // Nombre exacto de la tabla en la base de datos.
  timestamps: false,    
});

module.exports = TextProcessing;
