// autenticacion.js

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para autenticar usuarios
const autenticarUsuario = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere un token de autenticación.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = await Usuario.findById(decoded.id);
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Token no válido. Usuario no encontrado.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ mensaje: 'Token no válido.' });
  }
};

module.exports = autenticarUsuario;
