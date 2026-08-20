const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  specialInstructions: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'], default: 'pending' },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  type: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, trim: true },
  customerPhone: { type: String, trim: true },
  customerAddress: { type: String, trim: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  tax: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
  total: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'online', ''], default: '' },
  paymentDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true },
  priority: { type: String, enum: ['normal', 'high', 'rush'], default: 'normal' },
  estimatedReadyTime: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
