-- =============================================
-- Express Trade Kit - Database Initialization
-- Standalone PostgreSQL (no Supabase)
-- =============================================

-- ─── Extensions ───
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users (Auth) ───
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  name TEXT,
  phone TEXT UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  recovery_code TEXT,
  recovery_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Auth Sessions ───
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NULL,
  revoked_reason TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions (expires_at, revoked_at);

-- ─── Store Settings ───
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Enums ───
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'new', 'attempt', 'no_answer', 'confirmed', 'cancelled',
    'ready', 'shipped', 'delivered', 'returned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('home', 'desk');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Categories ───
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  image_url TEXT DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Products ───
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(12,2),
  cost_price NUMERIC(12,2),
  stock INT NOT NULL DEFAULT 0,
  sku TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  custom_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  status product_status NOT NULL DEFAULT 'draft',
  variants_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Product Images ───
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Customers ───
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT,
  commune TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Orders ───
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  wilaya TEXT,
  commune TEXT,
  address TEXT,
  delivery_type delivery_type NOT NULL DEFAULT 'home',
  status order_status NOT NULL DEFAULT 'new',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  tracking_number TEXT,
  shipping_company TEXT,
  note TEXT,
  ip_address TEXT,
  call_attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Blacklist ───
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ip', 'phone')),
  value TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blacklist_type_value_unique ON blacklist(type, value);
CREATE INDEX IF NOT EXISTS idx_blacklist_value ON blacklist(value);

-- ─── Order Items ───
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  selected_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Cart Items ───
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  selected_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  product_price NUMERIC NOT NULL,
  product_image_url TEXT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Pages ───
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  show_in TEXT NOT NULL DEFAULT 'none' CHECK (show_in IN ('header', 'footer', 'both', 'none')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Seed Data
-- =============================================

-- Default store settings
INSERT INTO store_settings (key, value) VALUES
  ('whatsapp_notifications', '{"enabled_notifications": {"order_confirmed": true, "order_shipped": true, "order_delivered": false, "new_order_admin": true}, "admin_phone": "", "api_configured": false}'::jsonb),
  ('shipping', '{"wilayas": [], "provider": {"active_provider": "manual"}, "yalidine": {"enabled": false, "api_base_url": "https://api.yalidine.app/v1", "api_id": "", "api_token": "", "shipper_name": "", "shipper_phone": "", "from_wilaya_name": "", "from_commune_name": "", "stopdesk_id": "", "default_product_name": ""}}'::jsonb),
  ('general', '{"store_name": "ECOMAX", "phone": "", "whatsapp_phone": "", "email": "", "currency": "DZD", "meta_title": "", "meta_description": ""}'::jsonb),
  ('appearance', '{"logo_url": "", "footer_logo_url": "", "favicon_url": "", "store_name": "ECOMAX", "primary_color": "#0d6847", "button_color": "#0d6847", "bg_color": "#f4f5f7", "heading_font": "Cairo", "body_font": "Cairo", "custom_domain": ""}'::jsonb),
  ('marketing', '{"pixel_id": "", "capi_token": "", "pixel_configured": false, "webhook_url": "", "enabled_events": {"PageView": true, "ViewContent": true, "AddToCart": true, "InitiateCheckout": true, "Purchase": true, "Lead": true}}'::jsonb),
  ('security', '{"turnstile_enabled": false, "site_key": "", "secret_key": "", "honeypot_enabled": true}'::jsonb),
  ('category_image_defaults_seeded', '{"seeded": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Default categories
INSERT INTO categories (name, slug, sort_order, image_url) VALUES
  ('أحذية', 'shoes', 1, 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200'),
  ('ساعات', 'watches', 2, 'https://images.unsplash.com/photo-1556910103-1c02745a8720?auto=format&fit=crop&q=80&w=1200'),
  ('ملابس رجالية', 'men-clothing', 3, 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1200'),
  ('ملابس نسائية', 'women-clothing', 4, NULL),
  ('إكسسوارات', 'accessories', 5, NULL),
  ('إلكترونيات', 'electronics', 6, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Default pages
INSERT INTO pages (title, slug, published) VALUES
  ('من نحن', '/about', true),
  ('سياسة الإرجاع', '/return-policy', true),
  ('شروط الاستخدام', '/terms', true),
  ('اتصل بنا', '/contact', false)
ON CONFLICT DO NOTHING;

-- ─── Done ───
SELECT '✅ Database initialized successfully!' AS status;
