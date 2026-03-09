
-- Add advanced coupon scope columns to discounts table
ALTER TABLE public.discounts
  ADD COLUMN IF NOT EXISTS apply_to text NOT NULL DEFAULT 'all' CHECK (apply_to IN ('all', 'specific')),
  ADD COLUMN IF NOT EXISTS product_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quantity_behavior text NOT NULL DEFAULT 'all' CHECK (quantity_behavior IN ('all', 'single', 'min_quantity')),
  ADD COLUMN IF NOT EXISTS min_quantity integer NOT NULL DEFAULT 1;
