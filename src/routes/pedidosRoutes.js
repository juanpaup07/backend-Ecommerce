// pedidosRoutes.js

const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const autenticarUsuario = require('../middleware/autenticacion');

// Rutas para pedidos
router.post('/', autenticarUsuario, pedidosController.crearPedido);
router.get('/:id', autenticarUsuario, pedidosController.obtenerPedidoPorId);
router.put('/completar/:pedidoId', autenticarUsuario, pedidosController.completarPedido);
router.put('/cancelar/:pedidoId', autenticarUsuario, pedidosController.cancelarPedido);
router.delete('/:id', autenticarUsuario, pedidosController.eliminarPedido);
router.get('/usuario/:idUsuario', autenticarUsuario, pedidosController.obtenerPedidosPorUsuario);
router.get('/', autenticarUsuario, pedidosController.obtenerPedidosUsuario);

module.exports = router;

