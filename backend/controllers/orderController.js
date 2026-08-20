const Order = require('../models/Order');
const Table = require('../models/Table');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search, dateFrom, dateTo } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('table', 'number name section')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'number name section capacity')
      .populate('customer')
      .populate('createdBy', 'name role');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { type, table, customerName, customerPhone, customerAddress, items, notes, priority, discount, discountType } = req.body;

    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return { ...item, status: 'pending' };
    });

    const settings = require('../models/Settings');
    const config = await settings.findOne() || {};
    const taxRate = config.taxRate || 0;
    const serviceChargeRate = config.serviceChargeRate || 0;
    const tax = subtotal * (taxRate / 100);
    const serviceCharge = subtotal * (serviceChargeRate / 100);
    let discountAmount = 0;
    if (discount) {
      discountAmount = discountType === 'percentage' ? subtotal * (discount / 100) : discount;
    }
    const total = subtotal + tax + serviceCharge - discountAmount;

    const orderData = {
      type, items: processedItems, subtotal, tax, serviceCharge,
      discount: discountAmount, discountType: discountType || 'fixed',
      total, customerName, customerPhone, customerAddress,
      notes, priority: priority || 'normal',
      createdBy: req.user._id,
    };

    if (table) orderData.table = table;
    if (customerName) {
      let customer = await Customer.findOne({ phone: customerPhone });
      if (customer) {
        customer.totalOrders += 1;
        customer.totalSpent += total;
        await customer.save();
        orderData.customer = customer._id;
      } else if (customerPhone) {
        customer = await Customer.create({
          name: customerName, phone: customerPhone,
          totalOrders: 1, totalSpent: total,
        });
        orderData.customer = customer._id;
      }
    }

    const order = await Order.create(orderData);

    if (table) {
      await Table.findByIdAndUpdate(table, { status: 'occupied', currentOrder: order._id });
    }

    // Deduct inventory for items that have inventory linkage
    for (const item of processedItems) {
      const menuItem = require('../models/MenuItem');
      const menuDoc = await menuItem.findById(item.menuItem);
      if (menuDoc && menuDoc.inventoryItem && menuDoc.inventoryDeduction > 0) {
        await Inventory.findByIdAndUpdate(
          menuDoc.inventoryItem,
          { $inc: { quantity: -menuDoc.inventoryDeduction * item.quantity } }
        );
      }
    }

    // Notify kitchen
    const kitchenUsers = await require('../models/User').find({ role: 'kitchen', isActive: true });
    const notifications = kitchenUsers.map(u => ({
      user: u._id, type: 'order', title: 'New Order',
      message: `Order ${order.orderNumber} received - ${order.type}`,
      relatedId: order._id, relatedModel: 'Order',
    }));
    if (notifications.length) await Notification.insertMany(notifications);

    // Notify managers
    const managers = await require('../models/User').find({ role: 'manager', isActive: true });
    const managerNotifs = managers.map(u => ({
      user: u._id, type: 'order', title: 'New Order',
      message: `Order ${order.orderNumber} created - Total: Rs.${total.toFixed(2)}`,
      relatedId: order._id, relatedModel: 'Order',
    }));
    if (managerNotifs.length) await Notification.insertMany(managerNotifs);

    await AuditLog.create({
      user: req.user._id, action: 'create', entity: 'Order', entityId: order._id,
      details: { orderNumber: order.orderNumber, total, type },
    });

    const populated = await Order.findById(order._id)
      .populate('table', 'number name section')
      .populate('createdBy', 'name role');

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to('kitchen').emit('new-order', populated);
      req.app.get('io').to('manager').emit('order-updated', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served'],
      served: ['completed'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${order.status} to ${status}` });
    }

    order.status = status;
    if (status === 'ready') {
      order.estimatedReadyTime = new Date();
    }
    if (status === 'served' || status === 'completed') {
      order.completedAt = new Date();
    }
    await order.save();

    // Update table if order is completed
    if ((status === 'completed' || status === 'cancelled') && order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    // Update item statuses if bulk updating
    if (status === 'preparing') {
      order.items.forEach(item => { item.status = 'preparing'; });
      await order.save();
    }
    if (status === 'ready') {
      order.items.forEach(item => { item.status = 'ready'; });
      await order.save();
    }

    // Notify relevant users
    const notifTargets = await require('../models/User').find({
      role: { $in: ['manager', 'staff'] }, isActive: true
    });
    const notifs = notifTargets.map(u => ({
      user: u._id, type: 'order', title: 'Order Status Update',
      message: `Order ${order.orderNumber} is now ${status}`,
      relatedId: order._id, relatedModel: 'Order',
    }));
    if (notifTargets.length) await Notification.insertMany(notifs);

    const populated = await Order.findById(order._id)
      .populate('table', 'number name section')
      .populate('createdBy', 'name role');

    if (req.app.get('io')) {
      req.app.get('io').emit('order-status-change', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    const { itemStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const item = order.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Order item not found' });

    item.status = itemStatus;
    await order.save();

    // Check if all items are ready
    const allReady = order.items.every(i => i.status === 'ready' || i.status === 'served' || i.status === 'cancelled');
    if (allReady && order.status === 'preparing') {
      order.status = 'ready';
      order.estimatedReadyTime = new Date();
      await order.save();
    }

    const populated = await Order.findById(order._id)
      .populate('table', 'number name section')
      .populate('createdBy', 'name role');

    if (req.app.get('io')) {
      req.app.get('io').emit('order-status-change', populated);
      req.app.get('io').to('manager').emit('order-updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }
    order.status = 'cancelled';
    await order.save();

    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    // Restore inventory
    for (const item of order.items) {
      const menuItem = require('../models/MenuItem');
      const menuDoc = await menuItem.findById(item.menuItem);
      if (menuDoc && menuDoc.inventoryItem && menuDoc.inventoryDeduction > 0) {
        await Inventory.findByIdAndUpdate(
          menuDoc.inventoryItem,
          { $inc: { quantity: menuDoc.inventoryDeduction * item.quantity } }
        );
      }
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('order-status-change', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'preparing', 'ready'] },
    })
      .populate('table', 'number name')
      .populate('createdBy', 'name')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({ createdAt: { $gte: today, $lt: tomorrow } });
    const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
    const totalOrders = todayOrders.length;
    const pendingOrders = todayOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
    const completedOrders = todayOrders.filter(o => o.status === 'completed').length;

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = await Order.find({ createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } });
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

    // Popular items
    const popularItems = await Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Hourly revenue for today
    const hourlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $hour: '$createdAt' }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Low stock items
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] },
      isActive: true,
    }).populate('supplier', 'name phone');

    // Active tables
    const tableStats = await Table.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const revenue = monthlyRevenue;
    const orders = monthlyOrders.length;

    // Weekly revenue
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weeklyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: weekStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      today: { revenue: totalRevenue, orders: totalOrders, pending: pendingOrders, completed: completedOrders },
      monthly: { revenue: monthlyRevenue, orders: monthlyOrders.length },
      weekly: { revenue, orders },
      popularItems, hourlyRevenue, statusBreakdown, lowStockItems,
      tableStats: tableStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, groupBy = 'day' } = req.query;
    const match = { status: { $ne: 'cancelled' } };
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    let groupId;
    if (groupBy === 'day') groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    else if (groupBy === 'month') groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    else groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

    const sales = await Order.aggregate([
      { $match: match },
      { $group: { _id: groupId, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
    const totalOrders = sales.reduce((sum, s) => sum + s.orders, 0);

    res.json({ sales, summary: { totalRevenue, totalOrders, avgOrder: totalOrders ? totalRevenue / totalOrders : 0 } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
