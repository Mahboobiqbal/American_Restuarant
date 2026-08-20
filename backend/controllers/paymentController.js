const Payment = require('../models/Payment');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, method, status, dateFrom, dateTo } = req.query;
    const query = {};
    if (method) query.method = method;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('order', 'orderNumber total')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ payments, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { orderId, amount, method, reference, notes } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const payment = await Payment.create({
      order: orderId, amount, method, reference, notes,
      processedBy: req.user._id,
    });

    order.paymentStatus = 'paid';
    order.paymentMethod = method;
    order.paymentDate = new Date();
    await order.save();

    await AuditLog.create({
      user: req.user._id, action: 'payment', entity: 'Payment', entityId: payment._id,
      details: { orderNumber: order.orderNumber, amount, method },
    });

    if (req.app.get('io')) {
      req.app.get('io').emit('payment-processed', { order, payment });
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = await Payment.find({ createdAt: { $gte: today, $lt: tomorrow }, status: 'completed' });
    const summary = {
      total: todayPayments.reduce((s, p) => s + p.amount, 0),
      cash: todayPayments.filter(p => p.method === 'cash').reduce((s, p) => s + p.amount, 0),
      card: todayPayments.filter(p => p.method === 'card').reduce((s, p) => s + p.amount, 0),
      upi: todayPayments.filter(p => p.method === 'upi').reduce((s, p) => s + p.amount, 0),
      online: todayPayments.filter(p => p.method === 'online').reduce((s, p) => s + p.amount, 0),
      count: todayPayments.length,
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
