const Inventory = require('../models/Inventory');
const AuditLog = require('../models/AuditLog');

exports.getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search, lowStock } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minQuantity'] };
    }

    const total = await Inventory.countDocuments(query);
    const items = await Inventory.find(query)
      .populate('supplier', 'name phone')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('supplier');
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restockItem = async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    item.quantity += quantity;
    item.lastRestocked = new Date();
    await item.save();

    await AuditLog.create({
      user: req.user._id, action: 'restock', entity: 'Inventory', entityId: item._id,
      details: { name: item.name, quantityAdded: quantity, newQuantity: item.quantity },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json({ message: 'Item deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInventoryCategories = async (req, res) => {
  try {
    const categories = await Inventory.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
