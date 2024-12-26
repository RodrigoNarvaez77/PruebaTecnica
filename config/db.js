const { Sequelize } = require('sequelize');

// Instancia de Sequelize para SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Archivo donde se almacenará la base de datos
  logging: false, // Desactiva el logging si no necesitas ver las consultas SQL
});

// Prueba de la conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos SQLite.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
})();

module.exports = sequelize;