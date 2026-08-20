const express = require('express');
const router = express.Router();
const { getPayments, processPayment, getPaymentSummary } = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/summary', authorize('admin', 'manager'), getPaymentSummary);
router.get('/', getPayments);
router.post('/', authorize('admin', 'manager', 'staff'), processPayment);

module.exports = router;
