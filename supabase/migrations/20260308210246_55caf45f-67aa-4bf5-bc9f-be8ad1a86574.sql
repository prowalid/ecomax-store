
-- Create pages table
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL,
  content text DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Public write pages" ON public.pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update pages" ON public.pages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete pages" ON public.pages FOR DELETE USING (true);

-- Create discounts table
CREATE TABLE public.discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value numeric NOT NULL DEFAULT 0,
  usage_count integer NOT NULL DEFAULT 0,
  usage_limit integer DEFAULT NULL,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read discounts" ON public.discounts FOR SELECT USING (true);
CREATE POLICY "Public write discounts" ON public.discounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update discounts" ON public.discounts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete discounts" ON public.discounts FOR DELETE USING (true);

-- Insert default settings rows for shipping, general, appearance
INSERT INTO public.store_settings (key, value) VALUES
  ('shipping', '{"wilayas": []}'),
  ('general', '{"store_name": "متجري", "phone": "", "email": "", "currency": "DZD"}'),
  ('appearance', '{"logo_url": "", "store_name": "متجري", "primary_color": "#0d6847", "button_color": "#0d6847", "bg_color": "#f4f5f7", "heading_font": "Cairo", "body_font": "Cairo", "custom_domain": ""}')
ON CONFLICT DO NOTHING;

-- Insert default pages
INSERT INTO public.pages (title, slug, published) VALUES
  ('من نحن', '/about', true),
  ('سياسة الإرجاع', '/return-policy', true),
  ('شروط الاستخدام', '/terms', true),
  ('اتصل بنا', '/contact', false);
