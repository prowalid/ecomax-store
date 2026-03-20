DROP INDEX IF EXISTS idx_products_slug_unique;

ALTER TABLE products
  DROP COLUMN IF EXISTS slug;
