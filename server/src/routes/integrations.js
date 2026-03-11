const express = require('express');
const router = express.Router();
const { facebookCapi, whatsappNotify, updateGreenApi, testOrderWebhook } = require('../controllers/integrationsController');
const authMiddleware = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const capiRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many tracking events. Slow down.',
});

// Public route for Facebook Pixel CAPI (triggered by storefront visitors)
router.post('/facebook-capi', capiRateLimit, facebookCapi);

// Protected Admin Route
router.use(authMiddleware);

// Admin testing/manual WhatsApp send endpoint
router.post('/whatsapp-notify', whatsappNotify);

// Verifying and configuring Green API needs to be restricted to admins
router.post('/update-green-api', updateGreenApi);
router.post('/test-webhook', testOrderWebhook);

module.exports = router;
