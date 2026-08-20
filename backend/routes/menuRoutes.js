const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', authorize('admin', 'manager'), createMenuItem);
router.put('/:id', authorize('admin', 'manager'), updateMenuItem);
router.delete('/:id', authorize('admin'), deleteMenuItem);

module.exports = router;
