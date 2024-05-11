const express = require('express');
const router = express.Router();
const librosController = require('../controllers/librosController');
const autenticarUsuario = require('../middleware/autenticacion');

// Rutas para libros
router.post('/',autenticarUsuario, librosController.crearLibro);
router.get('/', librosController.obtenerLibros);
router.get('/:id', librosController.obtenerLibroPorId);
router.put('/:id',autenticarUsuario, librosController.actualizarLibro);
router.delete('/:id',autenticarUsuario, librosController.eliminarLibro);

module.exports = router;
