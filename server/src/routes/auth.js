const express = require('express');
const router = express.Router();
const { 
  register, login, getMe, checkSetupStatus, refresh, logout,
  getProfile, updateProfile, changePassword,
  setup2FA, verify2FA, disable2FA,
  recoverPassword, resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { createRateLimit, loginLimiter } = require('../middleware/rateLimit');
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
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/recover-password', authRateLimit, recoverPassword);
router.post('/reset-password', authRateLimit, resetPassword);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/2fa/setup', authMiddleware, setup2FA);
router.post('/2fa/verify', authMiddleware, verify2FA);
router.post('/2fa/disable', authMiddleware, disable2FA);

module.exports = router;
