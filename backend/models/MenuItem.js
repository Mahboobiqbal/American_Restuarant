const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  spiceLevel: { type: Number, min: 0, max: 5, default: 0 },
  preparationTime: { type: Number, default: 15 },
  costPrice: { type: Number, min: 0, default: 0 },
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  inventoryDeduction: { type: Number, default: 0 },
}, { timestamps: true });

menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
