const { z } = require('zod');

exports.loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().trim().regex(/^\d{6}$/, 'Valid two-factor code is required').optional(),
});

exports.registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
