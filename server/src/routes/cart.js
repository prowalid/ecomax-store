const express = require('express');
const router = express.Router();
const { 
  getCartItems, 
  addOrUpdateCartItem, 
  updateCartItemQuantity, 
  deleteCartItem, 
  clearCart 
} = require('../controllers/cartController');
const { createRateLimit } = require('../middleware/rateLimit');

const cartWriteRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many cart updates. Please slow down.',
});

// All cart routes are public since they rely on frontend-generated session IDs
router.get('/:sessionId', getCartItems);
router.post('/', cartWriteRateLimit, addOrUpdateCartItem);
router.patch('/:itemId', cartWriteRateLimit, updateCartItemQuantity);
router.delete('/:itemId', cartWriteRateLimit, deleteCartItem);
router.delete('/session/:sessionId', cartWriteRateLimit, clearCart);

module.exports = router;
