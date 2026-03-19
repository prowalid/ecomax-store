const { z } = require('zod');

const imageUrlSchema = z.string().refine(
  (value) => {
    if (!value) return false;

    if (value.startsWith('/uploads/')) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid image URL' }
);

exports.createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
  image_url: imageUrlSchema.nullable().optional(),
});

exports.updateCategorySchema = exports.createCategorySchema.partial();
