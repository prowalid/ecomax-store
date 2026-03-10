const express = require('express');
const router = express.Router();
const { register, login, getMe, checkSetupStatus } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/setup-status', checkSetupStatus);
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
