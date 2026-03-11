const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { saveSettingsSchema } = require('../validators/settingsSchemas');

// Public route to read settings (Used by storefront for appearance/general info and pixel fetching)
router.get('/:key', optionalAuthMiddleware, getSettings);

// Protected routes (Admin changing configuration)
router.use(authMiddleware);

router.put('/:key', validateBody(saveSettingsSchema), saveSettings);

module.exports = router;
