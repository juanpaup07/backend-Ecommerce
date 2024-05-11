const mongoose = require('mongoose');

// Esquema para el modelo de Usuario
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now },
  libros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Libro' }], // Lista de libros asociados al usuario
  pedidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }], // Lista de pedidos asociados al usuario
  activo: { type: Boolean, default: true } // Indicador de si el usuario está activo o no
});

// Modelo de Usuario
const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
