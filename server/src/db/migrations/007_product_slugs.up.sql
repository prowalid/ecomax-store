ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug TEXT;

WITH ranked_products AS (
  SELECT
    id,
    created_at,
    CASE
      WHEN base_slug = '' THEN 'product'
      ELSE base_slug
    END AS normalized_base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY CASE
        WHEN base_slug = '' THEN 'product'
        ELSE base_slug
      END
      ORDER BY created_at ASC, id ASC
    ) AS slug_rank
  FROM (
    SELECT
      id,
      created_at,
      trim(both '-' FROM regexp_replace(
        regexp_replace(lower(COALESCE(name, '')), '[^a-z0-9\\s-]+', '', 'g'),
        '\\s+',
        '-',
        'g'
      )) AS base_slug
    FROM products
  ) prepared_products
)
UPDATE products AS p
SET slug = CASE
  WHEN ranked_products.slug_rank = 1 THEN ranked_products.normalized_base_slug
  ELSE ranked_products.normalized_base_slug || '-' || ranked_products.slug_rank
END
FROM ranked_products
WHERE p.id = ranked_products.id
  AND (p.slug IS NULL OR p.slug = '');

ALTER TABLE products
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products (slug);
