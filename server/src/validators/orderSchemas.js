const { z } = require('zod');

exports.createOrderSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_phone: z.string().min(8, 'Valid phone is required'),
  customer_id: z.string().uuid().optional().nullable(),
  wilaya: z.string().min(1, 'Wilaya is required'),
  commune: z.string().min(1, 'Commune is required'),
  address: z.string().optional().nullable(),
  delivery_type: z.enum(['home', 'desk']).default('home'),
  subtotal: z.number().min(0),
  shipping_cost: z.number().min(0),
  total: z.number().min(0),
  note: z.string().optional().nullable(),
  discount_code: z.string().optional().nullable(),
  discount_amount: z.number().min(0).optional().nullable(),
  
  items: z.array(z.object({
    product_id: z.string().uuid('Valid product ID is required'),
    product_name: z.string().min(1),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0),
    total: z.number().min(0)
  })).min(1, 'At least one item is required in the order')
});

exports.updateOrderStatusSchema = z.object({
  status: z.enum(['new', 'attempt', 'no_answer', 'confirmed', 'ready', 'shipped', 'delivered', 'returned', 'cancelled']),
});
