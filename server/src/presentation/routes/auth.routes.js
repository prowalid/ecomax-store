const express = require('express');
const {
  register,
  login,
  getMe,
  checkSetupStatus,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  recoverPassword,
  resetPassword,
} = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');
const { createRateLimit, loginLimiter } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validators/authSchemas');

const router = express.Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

const authRateLimit = createRateLimit({
  scope: 'auth:public',
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Too many auth attempts. Please try again later.',
});

const passwordRecoveryRateLimit = createRateLimit({
  scope: 'auth:recover-password',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'تم تجاوز الحد المسموح به لمحاولات استرجاع كلمة المرور. يرجى المحاولة لاحقًا.',
  identifier: (req) => req.body?.phone,
});

const passwordResetRateLimit = createRateLimit({
  scope: 'auth:reset-password',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'تم تجاوز الحد المسموح به لمحاولات إعادة تعيين كلمة المرور. يرجى المحاولة لاحقًا.',
  identifier: (req) => req.body?.phone || req.body?.code,
});

router.get('/setup-status', checkSetupStatus);
router.post('/register', authRateLimit, validateBody(registerSchema), register);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/recover-password', passwordRecoveryRateLimit, recoverPassword);
router.post('/reset-password', passwordResetRateLimit, resetPassword);

router.get('/me', authMiddleware, getMe);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/2fa/setup', authMiddleware, setup2FA);
router.post('/2fa/verify', authMiddleware, verify2FA);
router.post('/2fa/disable', authMiddleware, disable2FA);

module.exports = router;
