const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  name: { type: String, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'maintenance'], default: 'available' },
  section: { type: String, enum: ['indoor', 'outdoor', 'private', 'bar'], default: 'indoor' },
  isActive: { type: Boolean, default: true },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
