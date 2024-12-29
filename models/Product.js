const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  price_sale: { type: Number },
  type_product: { type: String, required: true },
  type_stock: { type: Boolean, required: true },
  stock: { type: Number },
  category: { type: String, required: true },
  code_sku: { type: String },
  code_bar: { type: String },
  whidth: { type: Number },
  height: { type: Number },
  weight: { type: Number },
  length: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Relación con el usuario
  
});

module.exports = mongoose.model('Product', productSchema);
