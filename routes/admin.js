const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Obtener todos los productos (solo admin)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
