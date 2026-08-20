const Supplier = require('../models/Supplier');

exports.getSuppliers = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ];
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
