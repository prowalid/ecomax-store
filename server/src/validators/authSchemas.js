const { z } = require('zod');

exports.loginSchema = z.object({
  phone: z.string().trim().regex(/^0[5-7][0-9]{8}$/, 'Valid Algerian phone is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().trim().regex(/^\d{6}$/, 'Valid two-factor code is required').optional(),
});

exports.registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().regex(/^0[5-7][0-9]{8}$/, 'Valid Algerian phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
