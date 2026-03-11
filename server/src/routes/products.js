const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductImages,
  addProductImage,
  deleteProductImage,
  reorderProductImages
} = require('../controllers/productsController');
const authMiddleware = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { 
  createProductSchema, 
  updateProductSchema, 
  addProductImageSchema, 
  reorderProductImagesSchema 
} = require('../validators/productSchemas');

// Public read routes for storefront. If a valid admin token is present, controller returns all products.
router.get('/', optionalAuthMiddleware, getProducts);
router.get('/:id/images', optionalAuthMiddleware, getProductImages);

// Protected routes (Only admins can manage products/images)
router.use(authMiddleware);
router.post('/', validateBody(createProductSchema), createProduct);
router.patch('/:id', validateBody(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

// Product Images routes
router.post('/:id/images', validateBody(addProductImageSchema), addProductImage);
router.put('/:id/images/reorder', validateBody(reorderProductImagesSchema), reorderProductImages);
router.delete('/:id/images/:imageId', deleteProductImage);

module.exports = router;
