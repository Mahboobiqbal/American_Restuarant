const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['admin', 'manager', 'kitchen', 'staff', 'all'] },
  type: { type: String, enum: ['order', 'reservation', 'inventory', 'payment', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ role: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
