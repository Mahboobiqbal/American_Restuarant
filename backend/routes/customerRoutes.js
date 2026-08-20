const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', authorize('admin', 'manager', 'staff'), createCustomer);
router.put('/:id', authorize('admin', 'manager'), updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;
