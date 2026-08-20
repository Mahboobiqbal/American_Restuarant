const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, entity, action, dateFrom, dateTo } = req.query;
    const query = {};
    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
