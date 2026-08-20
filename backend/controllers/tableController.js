const Table = require('../models/Table');

exports.getTables = async (req, res) => {
  try {
    const { status, section } = req.query;
    const query = {};
    if (status) query.status = status;
    if (section) query.section = section;
    const tables = await Table.find(query).populate('currentOrder', 'orderNumber status').sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('currentOrder');
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status, currentOrder: status === 'available' ? null : undefined },
      { new: true }
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
