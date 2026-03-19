const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/CategoriesController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/categorySchemas');

const router = express.Router();

router.get('/', getCategories);

router.use(authMiddleware);
router.post('/', validateBody(createCategorySchema), createCategory);
router.patch('/:id', validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
