const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name:       { type: String, required: true },
  category:   { type: String },
  stock:      { type: Number, required: true, default: 0 },
  minStock:   { type: Number, default: 50 },
  unit:       { type: String, default: 'tablets' },
  expiryDate: { type: String },
  price:      { type: Number, default: 0 },
  supplier:   { type: String },
  createdAt:  { type: String }
});

module.exports = mongoose.model('Inventory', inventorySchema);
