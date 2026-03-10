const express = require('express');
const router = express.Router();
const { getOrders, getOrderItems, createOrder, updateOrderStatus } = require('../controllers/ordersController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderSchemas');

// Public route to create orders (Store checkout)
router.post('/', validateBody(createOrderSchema), createOrder);

// Protected routes (Admin viewing/managing orders)
router.use(authMiddleware);

router.get('/', getOrders);
router.get('/:id/items', getOrderItems);
router.patch('/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
