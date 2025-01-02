// routes/clients.js
const express = require('express');
const Client = require('../models/Client');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/clients
// @desc    Obtener todos los clientes del usuario autenticado
// @access  Privado
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id });
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET /api/clients/:id
// @desc    Obtener un cliente por ID (solo si pertenece al usuario)
// @access  Privado
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });

    if (!client) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST /api/clients
// @desc    Crear un nuevo cliente
// @access  Privado
router.post('/', auth, async (req, res) => {
  const { name, email, phone } = req.body;

  // Validación básica
  if (!name || !email) {
    return res.status(400).json({ msg: 'Por favor, completa los campos requeridos' });
  }

  try {
    const newClient = new Client({
      name,
      email,
      phone,
      user: req.user.id
    });

    const client = await newClient.save();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT /api/clients/:id
// @desc    Actualizar un cliente existente
// @access  Privado
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone } = req.body;

  // Construir objeto de cliente actualizado
  const clientFields = {};
  if (name) clientFields.name = name;
  if (email) clientFields.email = email;
  if (phone) clientFields.phone = phone;

  try {
    let client = await Client.findOne({ _id: req.params.id, user: req.user.id });

    if (!client) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    // Actualizar
    client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: clientFields },
      { new: true }
    );

    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE /api/clients/:id
// @desc    Eliminar un cliente
// @access  Privado
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });

    if (!client) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    await Client.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Cliente eliminado' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
