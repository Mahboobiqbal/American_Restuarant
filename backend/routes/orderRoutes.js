const express = require('express');
const router = express.Router();
const {
  getOrders, getOrder, createOrder, updateOrderStatus, updateItemStatus,
  cancelOrder, getKitchenOrders, getDashboardStats, getSalesReport,
} = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/dashboard', authorize('admin', 'manager'), getDashboardStats);
router.get('/reports/sales', authorize('admin', 'manager'), getSalesReport);
router.get('/kitchen', authorize('kitchen', 'admin', 'manager'), getKitchenOrders);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', authorize('admin', 'manager', 'staff'), createOrder);
router.put('/:id/status', authorize('admin', 'manager', 'kitchen'), updateOrderStatus);
router.put('/:id/items/:itemId/status', authorize('admin', 'manager', 'kitchen'), updateItemStatus);
router.put('/:id/cancel', authorize('admin', 'manager'), cancelOrder);

module.exports = router;
