const { z } = require('zod');

exports.createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().max(50000).default(''),
  published: z.boolean().default(false),
  show_in: z.enum(['header', 'footer', 'both', 'none']).default('none'),
});

exports.updatePageSchema = exports.createPageSchema.partial().extend({
  version: z.number().int().min(1, 'Version is required'),
});
