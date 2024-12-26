const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Configuración de Sequelize

const Combined = sequelize.define('combined', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false, // La URL es obligatoria
  },
  headline: {
    type: DataTypes.STRING,
    allowNull: false, // El título es obligatorio
  },
  description: {
    type: DataTypes.TEXT, // Descripción larga del contenido scrapeado
    allowNull: true, // Puede ser null si no hay descripción
  },
  task: {
    type: DataTypes.STRING,
    allowNull: false, // La tarea debe ser 'sentiment-analysis' o 'summarization'
  },
  sentiment: {
    type: DataTypes.STRING, // Resultado del análisis de sentimiento
    allowNull: true, // Permitimos null si la tarea no es sentiment-analysis
  },
  score: {
    type: DataTypes.DECIMAL(5, 2), // Puntuación del análisis de sentimiento
    allowNull: true, // Permitimos null si la tarea no es sentiment-analysis
  },
  summary: {
    type: DataTypes.TEXT, // Resumen generado para la descripción
    allowNull: true, // Permitimos null si la tarea no es summarization
  },
  error: {
    type: DataTypes.STRING, // Mensaje de error en caso de fallo en el procesamiento
    allowNull: true, // Opcional, solo se usa si ocurre un error
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Fecha de creación automática
  },
}, {
  tableName: 'combined', // Nombre de la tabla en la base de datos
  timestamps: false, // No agregar campos `createdAt` y `updatedAt`
});

module.exports = Combined;
