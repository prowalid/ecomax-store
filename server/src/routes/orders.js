const express = require('express');
const router = express.Router();
const { getOrders, getOrderItems, createOrder, updateOrderStatus } = require('../controllers/ordersController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderSchemas');
const { createRateLimit } = require('../middleware/rateLimit');

const createOrderRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: 'Too many order attempts. Please wait a moment.',
});

// Public route to create orders (Store checkout)
router.post('/', createOrderRateLimit, validateBody(createOrderSchema), createOrder);

// Protected routes (Admin viewing/managing orders)
router.use(authMiddleware);

router.get('/', getOrders);
router.get('/:id/items', getOrderItems);
router.patch('/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
