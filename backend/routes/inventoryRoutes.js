const express = require('express');
const router = express.Router();
const { getInventory, getInventoryItem, createInventoryItem, updateInventoryItem, restockItem, deleteInventoryItem, getInventoryCategories } = require('../controllers/inventoryController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/categories', getInventoryCategories);
router.get('/', authorize('admin', 'manager'), getInventory);
router.get('/:id', authorize('admin', 'manager'), getInventoryItem);
router.post('/', authorize('admin', 'manager'), createInventoryItem);
router.put('/:id', authorize('admin', 'manager'), updateInventoryItem);
router.put('/:id/restock', authorize('admin', 'manager'), restockItem);
router.delete('/:id', authorize('admin'), deleteInventoryItem);

module.exports = router;
