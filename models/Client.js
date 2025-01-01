const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Relación con el usuario
});

module.exports = mongoose.model('Client', clientSchema);
