const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, required: true, default: 0 },
  maxQuantity: { type: Number, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  lastRestocked: { type: Date },
  expiryDate: { type: Date },
  location: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minQuantity;
});

inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
