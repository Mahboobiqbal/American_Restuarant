const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'card', 'upi', 'online'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  reference: { type: String, trim: true },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
