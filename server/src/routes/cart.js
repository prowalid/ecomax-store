const express = require('express');
const router = express.Router();
const { 
  getCartItems, 
  addOrUpdateCartItem, 
  updateCartItemQuantity, 
  deleteCartItem, 
  clearCart 
} = require('../controllers/cartController');

// All cart routes are public since they rely on frontend-generated session IDs
router.get('/:sessionId', getCartItems);
router.post('/', addOrUpdateCartItem);
router.patch('/:itemId', updateCartItemQuantity);
router.delete('/:itemId', deleteCartItem);
router.delete('/session/:sessionId', clearCart);

module.exports = router;
