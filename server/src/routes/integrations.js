const express = require('express');
const router = express.Router();
const { facebookCapi, whatsappNotify, updateGreenApi } = require('../controllers/integrationsController');
const authMiddleware = require('../middleware/auth');

// Public route for Facebook Pixel CAPI (triggered by storefront visitors)
router.post('/facebook-capi', facebookCapi);

// Protected Admin Route
router.use(authMiddleware);

// Verifying and configuring Green API needs to be restricted to admins
router.post('/update-green-api', updateGreenApi);

module.exports = router;
