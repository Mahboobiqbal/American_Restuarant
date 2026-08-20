const MenuItem = require('../models/MenuItem');
const AuditLog = require('../models/AuditLog');

exports.getMenuItems = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search, isAvailable, isVegetarian } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isVegetarian !== undefined) query.isVegetarian = isVegetarian === 'true';
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .populate('category', 'name')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    await AuditLog.create({
      user: req.user._id, action: 'create', entity: 'MenuItem', entityId: item._id,
      details: { name: item.name, price: item.price },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
