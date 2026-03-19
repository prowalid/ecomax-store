const { z } = require('zod');

exports.createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(8, 'Valid phone is required').max(20),
  wilaya: z.string().max(50).nullable().optional(),
  commune: z.string().max(100).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});
