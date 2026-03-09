
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount_code text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
