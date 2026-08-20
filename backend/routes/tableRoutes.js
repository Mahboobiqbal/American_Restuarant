const express = require('express');
const router = express.Router();
const { getTables, getTable, createTable, updateTable, deleteTable, updateTableStatus } = require('../controllers/tableController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', getTables);
router.get('/:id', getTable);
router.post('/', authorize('admin', 'manager'), createTable);
router.put('/:id', authorize('admin', 'manager'), updateTable);
router.put('/:id/status', authorize('admin', 'manager', 'staff'), updateTableStatus);
router.delete('/:id', authorize('admin'), deleteTable);

module.exports = router;
