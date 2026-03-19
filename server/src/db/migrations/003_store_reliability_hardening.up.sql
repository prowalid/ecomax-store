DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_products_price_non_negative'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_price_non_negative
      CHECK (price >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_products_compare_price_non_negative'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_compare_price_non_negative
      CHECK (compare_price IS NULL OR compare_price >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_products_cost_price_non_negative'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_cost_price_non_negative
      CHECK (cost_price IS NULL OR cost_price >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_products_stock_non_negative'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_stock_non_negative
      CHECK (stock >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_products_name_not_blank'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_name_not_blank
      CHECK (length(btrim(name)) >= 2) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_orders_subtotal_non_negative'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT chk_orders_subtotal_non_negative
      CHECK (subtotal >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_orders_shipping_cost_non_negative'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT chk_orders_shipping_cost_non_negative
      CHECK (shipping_cost >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_orders_total_non_negative'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT chk_orders_total_non_negative
      CHECK (total >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_orders_customer_name_not_blank'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT chk_orders_customer_name_not_blank
      CHECK (length(btrim(customer_name)) >= 2) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_orders_customer_phone_not_blank'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT chk_orders_customer_phone_not_blank
      CHECK (length(btrim(customer_phone)) >= 9) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_order_items_quantity_positive'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT chk_order_items_quantity_positive
      CHECK (quantity > 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_order_items_unit_price_non_negative'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT chk_order_items_unit_price_non_negative
      CHECK (unit_price >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_order_items_total_non_negative'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT chk_order_items_total_non_negative
      CHECK (total >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_cart_items_quantity_positive'
  ) THEN
    ALTER TABLE cart_items
      ADD CONSTRAINT chk_cart_items_quantity_positive
      CHECK (quantity > 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_cart_items_product_price_non_negative'
  ) THEN
    ALTER TABLE cart_items
      ADD CONSTRAINT chk_cart_items_product_price_non_negative
      CHECK (product_price >= 0) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_customers_name_not_blank'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT chk_customers_name_not_blank
      CHECK (length(btrim(name)) >= 2) NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_customers_phone_not_blank'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT chk_customers_phone_not_blank
      CHECK (length(btrim(phone)) >= 9) NOT VALID;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_products_status_created_at
  ON products(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category_active_created_at
  ON products(category_id, created_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_products_sku
  ON products(sku)
  WHERE sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id_created_at
  ON orders(customer_id, created_at DESC)
  WHERE customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone_created_at
  ON orders(customer_phone, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_phone
  ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_customers_created_at
  ON customers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_items_session_created_at
  ON cart_items(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pages_published_show_in
  ON pages(show_in, updated_at DESC)
  WHERE published = true;
