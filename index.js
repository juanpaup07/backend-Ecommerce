// index.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const librosRoutes = require('./src/routes/librosRoutes');
const pedidosRoutes = require('./src/routes/pedidosRoutes'); // Corregido aquí
const login = require('./src/routes/login');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Configurar middleware
app.use(express.json());

// Configurar rutas
app.use('/usuarios', usuariosRoutes);
app.use('/libros', librosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/login', login);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Hubo un error en el servidor');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
