const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoriesController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/categorySchemas');

// Public route to view categories (for the store frontend)
router.get('/', getCategories);

// Protected routes (Only admins can manage categories)
router.use(authMiddleware);

router.post('/', validateBody(createCategorySchema), createCategory);
router.patch('/:id', validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
