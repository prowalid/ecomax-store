const express = require('express');
const router = express.Router();
const { 
  getDiscounts, 
  createDiscount, 
  updateDiscount, 
  deleteDiscount, 
  validateDiscount, 
  incrementDiscountUsage 
} = require('../controllers/discountsController');
const authMiddleware = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validate');
const { createDiscountSchema, updateDiscountSchema, validateDiscountSchema } = require('../validators/discountSchemas');

const validateRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 40,
  message: 'Too many discount validation attempts. Try again shortly.',
});

// Public storefront endpoints
router.post('/validate', validateRateLimit, validateBody(validateDiscountSchema), validateDiscount);

// Protected Admin dashboard endpoints
router.use(authMiddleware);

router.post('/:id/increment', incrementDiscountUsage);
router.get('/', getDiscounts);
router.post('/', validateBody(createDiscountSchema), createDiscount);
router.patch('/:id', validateBody(updateDiscountSchema), updateDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
