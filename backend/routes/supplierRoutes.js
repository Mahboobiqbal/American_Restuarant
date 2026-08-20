const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', authorize('admin', 'manager'), getSuppliers);
router.get('/:id', authorize('admin', 'manager'), getSupplier);
router.post('/', authorize('admin', 'manager'), createSupplier);
router.put('/:id', authorize('admin', 'manager'), updateSupplier);
router.delete('/:id', authorize('admin'), deleteSupplier);

module.exports = router;
