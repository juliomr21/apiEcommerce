const express = require('express');
const Client = require('../models/Client');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener clientes del usuario autenticado
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id });
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
