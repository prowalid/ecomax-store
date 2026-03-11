const { z } = require('zod');

exports.createDiscountSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  type: z.enum(['percentage', 'fixed'], { required_error: 'Type must be percentage or fixed' }),
  value: z.number().min(0, 'Value must be positive'),
  usage_limit: z.number().int().min(1).nullable().optional(),
  active: z.boolean().default(true),
  expires_at: z.string().datetime().nullable().optional(),
  apply_to: z.enum(['all', 'specific']).default('all'),
  product_ids: z.array(z.string().uuid()).default([]),
  quantity_behavior: z.enum(['all', 'single', 'min_quantity']).default('all'),
  min_quantity: z.number().int().min(1).default(1),
});

exports.updateDiscountSchema = exports.createDiscountSchema.partial();

exports.validateDiscountSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});
