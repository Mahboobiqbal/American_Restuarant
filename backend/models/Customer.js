const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  loyaltyPoints: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
