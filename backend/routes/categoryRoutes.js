const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', authorize('admin', 'manager'), createCategory);
router.put('/:id', authorize('admin', 'manager'), updateCategory);
router.delete('/:id', authorize('admin'), deleteCategory);

module.exports = router;
