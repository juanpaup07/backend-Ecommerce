// usuariosRoutes.js

const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const autenticarUsuario = require('../middleware/autenticacion');

// Rutas para usuarios
router.post('/', usuariosController.crearUsuario);
//router.get('/',autenticarUsuario, usuariosController.obtenerUsuarios);
router.get('/:id',autenticarUsuario, usuariosController.obtenerUsuarioPorId);
router.put('/:id',autenticarUsuario, usuariosController.actualizarUsuario);
router.delete('/:id',autenticarUsuario, usuariosController.desactivarUsuario);
router.get('/verificar', autenticarUsuario, (req, res) => {
    res.status(200).json({ mensaje: 'Usuario autenticado', usuario: req.usuario });
  });
module.exports = router;
