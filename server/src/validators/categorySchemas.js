const { z } = require('zod');

exports.createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
  image_url: z.string().url('Invalid image URL').nullable().optional(),
});

exports.updateCategorySchema = exports.createCategorySchema.partial();
