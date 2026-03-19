const { z } = require('zod');

const productOptionGroupSchema = z.object({
  name: z.string().trim().min(1, 'Option name is required'),
  values: z.array(z.string().trim().min(1, 'Option value is required')).min(1, 'At least one option value is required'),
});

exports.createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  compare_price: z.number().nullable().optional(),
  cost_price: z.number().nullable().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().optional().nullable(),
  category_id: z.string().uuid('Invalid category ID').nullable().optional(),
  image_url: z.string().url('Invalid image URL').nullable().optional(),
  custom_options: z.array(productOptionGroupSchema).optional().default([]),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
});

exports.updateProductSchema = exports.createProductSchema.partial();

exports.addProductImageSchema = z.object({
  image_url: z.string().url('Invalid image URL'),
});

exports.reorderProductImagesSchema = z.object({
  images: z.array(z.object({
    id: z.string().uuid('Invalid image ID'),
    sort_order: z.number().int(),
    image_url: z.string().url(),
  })).min(1, 'At least one image is required'),
});
