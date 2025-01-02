// routes/orders.js
const express = require('express');
const Order = require('../models/Orders');
const Client = require('../models/Client');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/orders
// @desc    Obtener todos los pedidos del usuario autenticado
// @access  Privado
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('client', ['name', 'email', 'phone'])
      .populate('products.product', ['name', 'price_sale']);
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET /api/orders/:id
// @desc    Obtener un pedido por ID (solo si pertenece al usuario)
// @access  Privado
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('client', ['name', 'email', 'phone'])
      .populate('products.product', ['name', 'price_sale']);

    if (!order) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST /api/orders
// @desc    Crear un nuevo pedido
// @access  Privado
router.post('/', auth, async (req, res) => {
  const { client, products, total,valor } = req.body;

  // Validación básica
  if (!client || !products || !total) {
    return res.status(400).json({ msg: 'Por favor, completa los campos requeridos' });
  }

  try {
    // Verifica que el cliente pertenece al usuario
    const existingClient = await Client.findOne({ _id: client, user: req.user.id });
    if (!existingClient) {
      return res.status(400).json({ msg: 'Cliente inválido' });
    }

    // Verifica que los productos pertenecen al usuario y que hay suficiente stock
    for (const item of products) {
      const product = await Product.findOne({ _id: item.product, user: req.user.id });
      if (!product) {
        return res.status(400).json({ msg: `Producto con ID ${item.product} no válido` });
      }
      if (product.type_stock && product.stock < item.quantity) {
        return res.status(400).json({ msg: `Stock insuficiente para el producto ${product.name}` });
      }
    }

    // Actualiza el stock de los productos
    for (const item of products) {
      if (item.quantity > 0) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    const newOrder = new Order({
      user: req.user.id,
      client,
      products,
      total,
      valor
    });

    const order = await newOrder.save();
    await Client.findByIdAndUpdate(
      client,
      {
        $inc: { pedidos: 1, gastoTotal: valor }, // Incrementa pedidos y suma al gasto total
      },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT /api/orders/:id
// @desc    Actualizar un pedido existente
// @access  Privado
router.put('/:id', auth, async (req, res) => {
  const { client, products, total } = req.body;

  // Construir objeto de pedido actualizado
  const orderFields = {};
  if (client) orderFields.client = client;
  if (products) orderFields.products = products;
  if (total) orderFields.total = total;
  if (req.body.date) orderFields.date = req.body.date;

  try {
    let order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Verifica que el cliente pertenece al usuario
    if (client) {
      const existingClient = await Client.findOne({ _id: client, user: req.user.id });
      if (!existingClient) {
        return res.status(400).json({ msg: 'Cliente inválido' });
      }
    }

    // Verifica que los productos pertenecen al usuario y que hay suficiente stock
    if (products) {
      for (const item of products) {
        const product = await Product.findOne({ _id: item.product, user: req.user.id });
        if (!product) {
          return res.status(400).json({ msg: `Producto con ID ${item.product} no válido` });
        }
        if (product.type_stock && product.stock < item.quantity) {
          return res.status(400).json({ msg: `Stock insuficiente para el producto ${product.name}` });
        }
      }

      // Actualiza el stock de los productos
      for (const item of products) {
        if (item.quantity > 0) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }
    }

    // Actualizar el pedido
    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: orderFields },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE /api/orders/:id
// @desc    Eliminar un pedido
// @access  Privado
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Opcional: Revertir el stock de los productos si se elimina el pedido
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    await Order.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Pedido eliminado' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
