const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  addProductImage,
  deleteProductImage,
  reorderProductImages,
} = require('../controllers/ProductsController');
const authMiddleware = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createSanitizeBody } = require('../middleware/sanitize');
const {
  createProductSchema,
  updateProductSchema,
  addProductImageSchema,
  reorderProductImagesSchema,
} = require('../validators/productSchemas');

const router = express.Router();

router.get('/', optionalAuthMiddleware, getProducts);
router.get('/:id/images', optionalAuthMiddleware, getProductImages);

router.use(authMiddleware);
router.post('/', createSanitizeBody(), validateBody(createProductSchema), createProduct);
router.patch('/:id', createSanitizeBody(), validateBody(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/images', createSanitizeBody(), validateBody(addProductImageSchema), addProductImage);
router.put('/:id/images/reorder', createSanitizeBody(), validateBody(reorderProductImagesSchema), reorderProductImages);
router.delete('/:id/images/:imageId', deleteProductImage);

module.exports = router;
