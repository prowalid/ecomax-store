const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch(e) {}
  }
  next();
};

// Public route to read settings (Used by storefront for appearance/general info and pixel fetching)
router.get('/:key', optionalAuth, getSettings);

// Protected routes (Admin changing configuration)
router.use(authMiddleware);

router.put('/:key', saveSettings);

module.exports = router;
