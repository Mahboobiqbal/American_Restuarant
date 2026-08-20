const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  partySize: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  specialRequests: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
