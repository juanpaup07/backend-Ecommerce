const mongoose = require('mongoose');

// Esquema para el modelo de Pedido
const pedidoSchema = new mongoose.Schema({
  libros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Libro' }],
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  comprador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado: { type: String, enum: ['en progreso', 'completado', 'cancelado'], default: 'en progreso' },
  total: { type: Number, default: 0 }, // Agregar el campo total
  fechaCreacion: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true } // Agregar el campo activo
});

// Modelo de Pedido
const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;
