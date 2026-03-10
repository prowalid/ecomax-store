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

// Public storefront endpoints
router.post('/validate', validateDiscount);
router.post('/:id/increment', incrementDiscountUsage);

// Protected Admin dashboard endpoints
router.use(authMiddleware);

router.get('/', getDiscounts);
router.post('/', createDiscount);
router.patch('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
