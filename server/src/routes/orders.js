const express = require('express');
const router = express.Router();
const { getOrders, getOrderItems, createOrder, updateOrderStatus, createYalidineOrderShipment } = require('../controllers/ordersController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderSchemas');
const { createRateLimit } = require('../middleware/rateLimit');

const { validateBotProtection } = require('../middleware/security');

const createOrderRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'لقد قمنا باكتشاف محاولات طلب كثيرة جداً من جهازك. يرجى الانتظار 5 دقائق والمحاولة مرة أخرى.',
});

// Public route to create orders (Store checkout)
router.post('/', createOrderRateLimit, validateBotProtection, validateBody(createOrderSchema), createOrder);

// Protected routes (Admin viewing/managing orders)
router.use(authMiddleware);

router.get('/', getOrders);
router.get('/:id/items', getOrderItems);
router.patch('/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/shipping/yalidine', createYalidineOrderShipment);

module.exports = router;
