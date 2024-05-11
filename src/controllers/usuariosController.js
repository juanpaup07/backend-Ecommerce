// usuariosController.js

const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');


// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashContraseña = await bcrypt.hash(contraseña, 10);

    // Crear el nuevo usuario con la contraseña hasheada y activo por defecto
    usuario = new Usuario({ nombre, email, contraseña: hashContraseña, activo: true });

    // Guardar el usuario en la base de datos
    await usuario.save();

    res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al crear el usuario' });
  }
};

// Obtener un usuario por su ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuarioId = req.usuario._id.toString(); // Convertir el ID del usuario autenticado a cadena
    const { id } = req.params; // ID del usuario a consultar
    // Verificar si el usuario autenticado está intentando ver su propio perfil
    if (usuarioId !== id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver el perfil de otro usuario' });
    }
    // Consultar el usuario por su ID
    const usuario = await Usuario.findOne({ _id: id, activo: true });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    // Enviar el usuario como respuesta
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al obtener el usuario' });
  }
};


// Actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, contraseña } = req.body;
    if (contraseña) {
      const hashContraseña = await bcrypt.hash(contraseña, 10);
      const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { nombre, email, contraseña: hashContraseña }, { new: true });
      if (!usuarioActualizado) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.status(200).json({ mensaje: 'Usuario actualizado exitosamente', usuario: usuarioActualizado });
    } else {
      const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { nombre, email }, { new: true });
      if (!usuarioActualizado) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.status(200).json({ mensaje: 'Usuario actualizado exitosamente', usuario: usuarioActualizado });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al actualizar el usuario' });
  }
};



// Desactivar un usuario (en lugar de eliminarlo)
exports.desactivarUsuario = async (req, res) => {
  try {
    // Verificar si el ID del usuario en la solicitud coincide con el ID del usuario autenticado
    if (req.usuario._id.toString() !== req.params.id.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para desactivar este usuario' });
    }

    const usuarioExistente = await Usuario.findOne({ _id: req.params.id, activo: true });
    if (!usuarioExistente) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }

    const usuarioDesactivado = await Usuario.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    res.status(200).json({ mensaje: 'Usuario desactivado exitosamente', usuario: usuarioDesactivado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al desactivar el usuario' });
  }
};


