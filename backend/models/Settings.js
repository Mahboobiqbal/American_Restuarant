const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Restaurant Atiq' },
  tagline: { type: String, default: 'Fine Dining Experience' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  currency: { type: String, default: 'PKR' },
  currencySymbol: { type: String, default: 'Rs.' },
  taxRate: { type: Number, default: 0 },
  serviceChargeRate: { type: Number, default: 0 },
  openingTime: { type: String, default: '09:00' },
  closingTime: { type: String, default: '23:00' },
  timezone: { type: String, default: 'Asia/Karachi' },
  logo: { type: String, default: '' },
  invoicePrefix: { type: String, default: 'INV' },
  lowStockThreshold: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
