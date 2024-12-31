// const express = require('express');
// const Product = require('../models/Product');
// const router = express.Router();

// // Obtener todos los productos
// router.get('/', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Agregar un nuevo producto (solo admin)
// router.post('/', async (req, res) => {
//   const { name, description, price, stock, category } = req.body;

//   try {
//     const newProduct = new Product({
//       name,
//       description,
//       price,
//       stock,
//       category
//     });

//     const product = await newProduct.save();
//     res.json(product);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Eliminar un producto (solo admin)
// router.delete('/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     await Product.deleteOne({ _id: req.params.id });

//     res.json({ msg: 'Product removed' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// module.exports = router;
const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Obtener productos del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Agregar un nuevo producto
router.post('/', authMiddleware, async (req, res) => {
  const {
    name,
    description,
    price,
    price_sale,
    type_product,
    type_stock,
    stock,
    category,
    code_sku,
    code_bar,
    whidth,
    height,
    weight,
    length,
  } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      price_sale,
      type_product,
      type_stock,
      stock,
      category,
      code_sku,
      code_bar,
      whidth,
      height,
      weight,
      length,
      user: req.user.id, // Vincula el producto al usuario autenticado
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Eliminar un producto del usuario autenticado
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id, // Verifica que el producto pertenece al usuario
    });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// Obtener producto por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id, // Verifica que el producto pertenece al usuario
    });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Editar un producto por id
router.put('/:id', authMiddleware, async (req, res) => {
  const {
    name,
    description,
    price,
    price_sale,
    type_product,
    type_stock,
    stock,
    category,
    code_sku,
    code_bar,
    whidth,
    height,
    weight,
    length,
  } = req.body;

  try {
    let product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id, // Verifica que el producto pertenece al usuario
    });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          description,
          price,
          price_sale,
          type_product,
          type_stock,
          stock,
          category,
          code_sku,
          code_bar,
          whidth,
          height,
          weight,
          length,
        },
      },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

