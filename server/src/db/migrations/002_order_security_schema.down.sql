DROP INDEX IF EXISTS idx_blacklist_value;
DROP INDEX IF EXISTS idx_blacklist_type_value_unique;
DROP TABLE IF EXISTS blacklist;

ALTER TABLE order_items DROP COLUMN IF EXISTS selected_options;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_label_url;
ALTER TABLE orders DROP COLUMN IF EXISTS ip_address;
ALTER TABLE cart_items DROP COLUMN IF EXISTS selected_options;
ALTER TABLE products DROP COLUMN IF EXISTS custom_options;
