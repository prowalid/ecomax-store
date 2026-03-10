const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoriesController');
const authMiddleware = require('../middleware/auth');

// Public route to view categories (for the store frontend)
router.get('/', getCategories);

// Protected routes (Only admins can manage categories)
router.use(authMiddleware);

router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
