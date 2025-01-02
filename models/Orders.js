const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que realizó el pedido
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Cliente asociado
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  valor: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);
