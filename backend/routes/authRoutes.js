const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile, changePassword, getUsers, createUser, updateUser, deleteUser } = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.get('/users', auth, authorize('admin'), getUsers);
router.post('/users', auth, authorize('admin'), createUser);
router.put('/users/:id', auth, authorize('admin'), updateUser);
router.delete('/users/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
