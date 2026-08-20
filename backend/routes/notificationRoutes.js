const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
