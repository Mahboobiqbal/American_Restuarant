const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  categories: [{ type: String, trim: true }],
  paymentTerms: { type: String, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  isActive: { type: Boolean, default: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
