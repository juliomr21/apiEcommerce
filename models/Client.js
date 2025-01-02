const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  pedidos: { type: Number, default: 0 }, // Campo para contar pedidos
  gastoTotal: { type: Number, default: 0 }, // Campo para el gasto total
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Relación con el usuario
});

module.exports = mongoose.model('Client', clientSchema);
