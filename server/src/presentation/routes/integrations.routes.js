const express = require('express');
const {
  facebookCapi,
  whatsappNotify,
  updateGreenApi,
  testOrderWebhook,
} = require('../controllers/IntegrationsController');
const authMiddleware = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const capiRateLimit = createRateLimit({
  scope: 'integrations:facebook-capi',
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many tracking events. Slow down.',
  identifier: (req) => req.body?.eventName || req.body?.event_name,
});

router.post('/facebook-capi', capiRateLimit, facebookCapi);

router.use(authMiddleware);
router.post('/whatsapp-notify', whatsappNotify);
router.post('/update-green-api', updateGreenApi);
router.post('/test-webhook', testOrderWebhook);

module.exports = router;
