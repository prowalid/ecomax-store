const express = require('express');
const { getSettings, saveSettings } = require('../controllers/SettingsController');
const authMiddleware = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { saveSettingsSchema } = require('../validators/settingsSchemas');

const router = express.Router();

router.get('/:key', optionalAuthMiddleware, getSettings);

router.use(authMiddleware);
router.put('/:key', validateBody(saveSettingsSchema), saveSettings);

module.exports = router;
