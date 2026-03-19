const express = require('express');
const {
  getCartItems,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart,
} = require('../controllers/CartController');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const cartWriteRateLimit = createRateLimit({
  scope: 'cart:write',
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many cart updates. Please slow down.',
  identifier: (req) => req.body?.session_id || req.params?.sessionId || req.query?.session_id,
});

router.get('/:sessionId', getCartItems);
router.post('/', cartWriteRateLimit, addOrUpdateCartItem);
router.patch('/:itemId', cartWriteRateLimit, updateCartItemQuantity);
router.delete('/:itemId', cartWriteRateLimit, deleteCartItem);
router.delete('/session/:sessionId', cartWriteRateLimit, clearCart);

module.exports = router;
