// authMiddleware.js

const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });

  try {
    const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuarioVerificado;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

module.exports = verificarToken;
