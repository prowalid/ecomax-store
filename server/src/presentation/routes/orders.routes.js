const express = require('express');
const {
  getOrders,
  getOrderItems,
  createOrder,
  updateOrderStatus,
  createOrderShipment,
} = require('../controllers/OrdersController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderSchemas');
const { createRateLimit } = require('../middleware/rateLimit');
const { validateBotProtection } = require('../middleware/security');
const { createIdempotencyMiddleware } = require('../middleware/idempotency');
const { createSanitizeBody } = require('../middleware/sanitize');

const router = express.Router();

const createOrderRateLimit = createRateLimit({
  scope: 'orders:create',
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'لقد قمنا باكتشاف محاولات طلب كثيرة جداً من جهازك. يرجى الانتظار 5 دقائق والمحاولة مرة أخرى.',
  identifier: (req) => req.body?.customer_phone,
});

async function orderCreateIdempotency(req, res, next) {
  const cacheService = req.app?.locals?.container?.resolve?.('cacheService');
  const middleware = createIdempotencyMiddleware({ cacheService });
  return middleware(req, res, next);
}

router.post('/', orderCreateIdempotency, createOrderRateLimit, createSanitizeBody(), validateBotProtection, validateBody(createOrderSchema), createOrder);

router.use(authMiddleware);

router.get('/', getOrders);
router.get('/:id/items', getOrderItems);
router.patch('/:id/status', createSanitizeBody(), validateBody(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/shipping/provider', createOrderShipment);

module.exports = router;
