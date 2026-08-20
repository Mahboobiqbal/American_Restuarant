const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');

exports.getCategories = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    await AuditLog.create({
      user: req.user._id, action: 'create', entity: 'Category', entityId: category._id,
      details: { name: category.name },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
