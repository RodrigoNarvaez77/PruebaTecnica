// Importamos las dependencias necesarias.
const express = require("express");
require('dotenv').config();
const Routes = require("./routes/routes"); // Importamos las rutas.
const sequelize = require('./config/db'); // Importamos la conexión a la base de datos.
const app = express(); // Creamos la aplicación Express.
const PORT = process.env.PORT || 3000; // Usamos la variable de entorno PORT o 3000 como predeterminado.

// Middleware para interpretar JSON en el cuerpo de las solicitudes.
app.use(express.json());

// Usamos las rutas desde la carpeta routes.
app.use("/api", Routes);

// Sincronizamos la base de datos y las tablas.
(async () => {
  try {
    await sequelize.sync({ force: false }); // Cambia a true solo si quieres reiniciar las tablas
    console.log('Base de datos y tablas sincronizadas.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error.message);
  }
})();

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
