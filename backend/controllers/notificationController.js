const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    const query = {
      $or: [
        { user: req.user._id },
        { role: req.user.role },
        { role: 'all' },
      ],
    };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    res.json({ notifications, total, unreadCount, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({
      $or: [{ user: req.user._id }, { role: req.user.role }, { role: 'all' }],
      isRead: false,
    }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
