const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductImages,
  addProductImage,
  deleteProductImage
} = require('../controllers/productsController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { 
  createProductSchema, 
  updateProductSchema, 
  addProductImageSchema, 
  reorderProductImagesSchema 
} = require('../validators/productSchemas');

// Protected routes (Only admins can manage products and view them via the dashboard)
router.use(authMiddleware);

router.get('/', getProducts);
router.post('/', validateBody(createProductSchema), createProduct);
router.patch('/:id', validateBody(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

// Product Images routes
router.get('/:id/images', getProductImages);
router.post('/:id/images', validateBody(addProductImageSchema), addProductImage);
router.put('/:id/images/reorder', validateBody(reorderProductImagesSchema), reorderProductImages);
router.delete('/:id/images/:imageId', deleteProductImage);

module.exports = router;
