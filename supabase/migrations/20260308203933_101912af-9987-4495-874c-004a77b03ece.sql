
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (no auth yet)
CREATE POLICY "Allow public read store_settings"
  ON public.store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert store_settings"
  ON public.store_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update store_settings"
  ON public.store_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default notification settings
INSERT INTO public.store_settings (key, value) VALUES
  ('whatsapp_notifications', '{"enabled_notifications": {"order_confirmed": true, "order_shipped": true, "order_delivered": false, "new_order_admin": true}, "admin_phone": "", "api_configured": false}'::jsonb);
