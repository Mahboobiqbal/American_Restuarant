const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', getSettings);
router.put('/', authorize('admin'), updateSettings);

module.exports = router;
