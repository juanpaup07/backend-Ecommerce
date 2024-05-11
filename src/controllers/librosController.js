// librosController.js

const Libro = require('../models/Libro');

// Crear un nuevo libro
exports.crearLibro = async (req, res) => {
  try {
    // Obtener el ID del usuario autenticado
    const vendedorId = req.usuario._id;

    // Extraer los datos del libro del cuerpo de la solicitud
    const { titulo, autor, editorial, añoPublicacion, genero, precio } = req.body;

    // Crear el nuevo libro asociado al vendedor
    const nuevoLibro = new Libro({ 
      titulo, 
      autor, 
      editorial, 
      añoPublicacion, 
      genero,
      precio, // Agregar el precio al libro
      vendedor: vendedorId, // Asociar el libro al usuario autenticado
      activo: true // Establecer el estado activo por defecto
    });

    // Guardar el libro en la base de datos
    await nuevoLibro.save();

    // Convertir el objeto libro a un objeto plano JSON
    const libroJSON = nuevoLibro.toObject();

    // Añadir el ID del vendedor al objeto JSON
    libroJSON.vendedor = vendedorId;

    // Enviar la respuesta con el libro actualizado
    res.status(201).json({ mensaje: 'Libro creado exitosamente', libro: libroJSON });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al crear el libro' });
  }
};






// Obtener todos los libros con filtros
exports.obtenerLibros = async (req, res) => {
  try {
    // Obtener los parámetros de consulta
    const { autor, editorial, añoPublicacion, genero } = req.query;

    // Construir el objeto de filtro
    const filtro = { activo: true }; // Filtrar solo libros activos
    if (autor) {
      // Utilizamos una expresión regular para buscar cualquier coincidencia parcial del autor
      filtro.autor = { $regex: new RegExp(autor, 'i') }; // 'i' para hacer la búsqueda insensible a mayúsculas y minúsculas
    }
    if (editorial) filtro.editorial = editorial;
    if (añoPublicacion) filtro.añoPublicacion = añoPublicacion;
    if (genero) filtro.genero = genero;

    // Buscar libros que coincidan con los criterios de filtro
    const libros = await Libro.find(filtro);

    res.status(200).json(libros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al obtener los libros' });
  }
};

// Obtener un libro por su ID
exports.obtenerLibroPorId = async (req, res) => {
  try {
    const libro = await Libro.findOne({ _id: req.params.id, activo: true });
    if (!libro) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json(libro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al obtener el libro' });
  }
};


// Actualizar un libro
exports.actualizarLibro = async (req, res) => {
  try {
    // Verificar si el usuario logueado es el propietario del libro
    const libro = await Libro.findOne({ _id: req.params.id, vendedor: req.usuario._id, activo: true });
    if (!libro) {
      return res.status(404).json({ mensaje: 'Libro no encontrado o no tienes permisos para actualizarlo' });
    }
    // Actualizar el libro
    const libroActualizado = await Libro.findOneAndUpdate({ _id: req.params.id, activo: true }, req.body, { new: true });
    if (!libroActualizado) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json({ mensaje: 'Libro actualizado exitosamente', libro: libroActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al actualizar el libro' });
  }
};



// Eliminar un libro
exports.eliminarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario._id;
    // Verificar si el usuario autenticado es el vendedor del libro
    const libro = await Libro.findOne({ _id: id, vendedor: usuarioId });
    if (!libro) {
      return res.status(403).json({ mensaje: 'El libro no existe o no tienes permiso para eliminar este libro' });
    }
    // Desactivar el libro estableciendo el atributo 'activo' en falso
    const libroDesactivado = await Libro.findByIdAndUpdate(id, { activo: false }, { new: true });
    if (!libroDesactivado) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json({ mensaje: 'Libro eliminado exitosamente', libro: libroDesactivado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al eliminar el libro' });
  }
};


