const express = require('express');
const router = express.Router();
const { register, login, getMe, checkSetupStatus, refresh, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validators/authSchemas');

const authRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Too many auth attempts. Please try again later.',
});

// Public routes
router.get('/setup-status', checkSetupStatus);
router.post('/register', authRateLimit, validateBody(registerSchema), register);
router.post('/login', authRateLimit, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
