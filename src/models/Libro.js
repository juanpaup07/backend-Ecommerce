// Libro.js

const mongoose = require('mongoose');

// Esquema para el modelo de Libro
const libroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  editorial: { type: String },
  añoPublicacion: { type: Number },
  genero: { type: String },
  precio: { type: Number }, // Agregar el campo precio
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Referencia al usuario vendedor
  activo: { type: Boolean, default: true }, // Campo para indicar si el libro está activo o no
  fechaRegistro: { type: Date, default: Date.now }
});

// Modelo de Libro
const Libro = mongoose.model('Libro', libroSchema);

module.exports = Libro;
