const express = require('express');
const router = express.Router();
const { getReservations, createReservation, updateReservation, deleteReservation } = require('../controllers/reservationController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', getReservations);
router.post('/', authorize('admin', 'manager', 'staff'), createReservation);
router.put('/:id', authorize('admin', 'manager'), updateReservation);
router.delete('/:id', authorize('admin'), deleteReservation);

module.exports = router;
