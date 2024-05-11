
// Crear un nuevo pedido
const Pedido = require('../models/Pedido');
const Libro = require('../models/Libro');

exports.crearPedido = async (req, res) => {
  try {
    const { libros } = req.body;
    const comprador = req.usuario._id; // El comprador es el usuario autenticado

    // Verificar que todos los libros pertenecen al mismo vendedor
    const primerLibro = await Libro.findById(libros[0]);
    if (!primerLibro) {
      return res.status(400).json({ mensaje: 'El libro no existe' });
    }
    const vendedorId = primerLibro.vendedor;
    if (!vendedorId) {
      return res.status(400).json({ mensaje: 'El libro no tiene un vendedor asociado' });
    }
    for (const libroId of libros) {
      const libro = await Libro.findById(libroId);
      if (!libro) {
        return res.status(400).json({ mensaje: 'Uno de los libros no existe' });
      }
      if (libro.vendedor.toString() !== vendedorId.toString()) {
        return res.status(400).json({ mensaje: 'Los libros deben pertenecer al mismo vendedor' });
      }
    }

    // Calcular el total sumando los precios de los libros
    let total = 0;
    for (const libroId of libros) {
      const libro = await Libro.findById(libroId).select('precio');
      total += libro.precio;
    }

    // Crear el nuevo pedido asociado al comprador y al vendedor
    const nuevoPedido = new Pedido({ libros, vendedor: vendedorId, comprador, estado: 'en progreso', total, activo: true });
    await nuevoPedido.save();

    // Obtener el pedido con los IDs del vendedor y el comprador
    const pedidoActualizado = await Pedido.findById(nuevoPedido._id)
      .populate('libros')
      .populate('vendedor', '_id')
      .populate('comprador', '_id');

    res.status(201).json({ mensaje: 'Pedido creado exitosamente', pedido: pedidoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al crear el pedido' });
  }
};



// Obtener todos los pedidos asociados a un usuario
exports.obtenerPedidosUsuario = async (req, res) => {
  try {
    const compradorId = req.usuario._id; // ID del usuario autenticado
    const { fechaInicio, fechaFin, estado } = req.query; // Obtener los parámetros de consulta

    // Construir el filtro para la consulta
    const filtro = { comprador: compradorId, activo: true }; // Agregar el filtro para los pedidos activos
    if (fechaInicio && fechaFin) {
      filtro.fechaCreacion = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
    }
    if (estado) {
      filtro.estado = estado;
    }

    // Realizar la consulta de pedidos con el filtro
    const pedidos = await Pedido.find(filtro);
    res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al obtener los pedidos del usuario' });
  }
};





// Obtener pedidos de un usuario por su ID
exports.obtenerPedidosPorUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.idUsuario;
    const pedidos = await Pedido.find({ comprador: idUsuario, activo: true }); // Agregar filtro para los pedidos activos
    res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al obtener los pedidos del usuario' });
  }
};




// Función para completar un pedido (solo el vendedor puede hacerlo)
exports.completarPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params; // ID del pedido a completar
    const usuarioId = req.usuario._id; // ID del usuario autenticado

    // Verificar si el usuario autenticado es el vendedor del pedido y si el pedido está activo
    const pedido = await Pedido.findOne({ _id: pedidoId, vendedor: usuarioId, estado: 'en progreso', activo: true });
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado, no está activo o no tienes permisos para completarlo' });
    }

    // Actualizar el estado del pedido a "completado"
    pedido.estado = 'completado';
    await pedido.save();

    // Desactivar todos los libros vendidos
    for (const libroId of pedido.libros) {
      await Libro.findByIdAndUpdate(libroId, { activo: false });
    }

    res.status(200).json({ mensaje: 'Pedido completado correctamente', pedido });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al completar el pedido' });
  }
};




// Función para cancelar un pedido (tanto el comprador como el vendedor pueden hacerlo)
exports.cancelarPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params; // ID del pedido a cancelar
    const usuarioId = req.usuario._id; // ID del usuario autenticado

    // Verificar si el usuario autenticado es el comprador o el vendedor del pedido y si el pedido está activo y en progreso
    const pedido = await Pedido.findOne({ _id: pedidoId, $or: [{ comprador: usuarioId }, { 'libros.vendedor': usuarioId }], estado: 'en progreso', activo: true });
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado, no está activo o no está en progreso, o no tienes permisos para cancelarlo' });
    }

    // Actualizar el estado del pedido a "cancelado"
    pedido.estado = 'cancelado';
    await pedido.save();

    res.status(200).json({ mensaje: 'Pedido cancelado correctamente', pedido });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al cancelar el pedido' });
  }
};



//Obtener pedido por ID

exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, activo: true });
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado o no está activo' });
    }

    // Verificar si el usuario está asociado con el pedido
    if (pedido.comprador.toString() !== req.usuario._id.toString() && pedido.vendedor.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para acceder a este pedido' });
    }

    // Verificar si el ID proporcionado coincide exactamente con el ID del pedido
    if (pedido._id.toString() !== req.params.id) {
      return res.status(400).json({ mensaje: 'El ID del pedido proporcionado no coincide exactamente con el ID del pedido encontrado' });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al obtener el pedido' });
  }
};


// Eliminar un pedido
exports.eliminarPedido = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const usuarioId = req.usuario._id;

    // Verificar si el usuario es el vendedor o el comprador del pedido
    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    if (pedido.comprador.toString() !== usuarioId.toString() && pedido.vendedor.toString() !== usuarioId.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este pedido' });
    }

    // Desactivar el pedido cambiando el valor de "activo" a false
    pedido.activo = false;
    await pedido.save();

    res.status(200).json({ mensaje: 'Pedido desactivado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Hubo un error al desactivar el pedido' });
  }
};




