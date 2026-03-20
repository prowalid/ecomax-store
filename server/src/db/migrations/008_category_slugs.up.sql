ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug TEXT;

WITH normalized_categories AS (
  SELECT
    c.id,
    COALESCE(
      NULLIF(
        lower(
          regexp_replace(
            regexp_replace(
              regexp_replace(trim(c.name), '[^[:alnum:][:space:]-]+', '', 'g'),
              '[[:space:]]+',
              '-',
              'g'
            ),
            '-+',
            '-',
            'g'
          )
        ),
        ''
      ),
      'category'
    ) AS base_slug
  FROM categories c
  WHERE c.slug IS NULL OR btrim(c.slug) = ''
),
ranked_categories AS (
  SELECT
    id,
    base_slug,
    row_number() OVER (PARTITION BY base_slug ORDER BY id) AS slug_rank
  FROM normalized_categories
),
existing_slug_counts AS (
  SELECT
    rc.id,
    rc.base_slug,
    rc.slug_rank,
    (
      SELECT COUNT(*)
      FROM categories c2
      WHERE c2.id <> rc.id
        AND c2.slug IS NOT NULL
        AND (
          c2.slug = rc.base_slug
          OR c2.slug ~ ('^' || regexp_replace(rc.base_slug, '([.^$|()\\[\\]{}*+?\\\\-])', '\\\1', 'g') || '-[0-9]+$')
        )
    ) AS existing_count
  FROM ranked_categories rc
)
UPDATE categories c
SET slug = CASE
  WHEN esc.existing_count + esc.slug_rank = 1 THEN esc.base_slug
  ELSE esc.base_slug || '-' || (esc.existing_count + esc.slug_rank)
END
FROM existing_slug_counts esc
WHERE c.id = esc.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_unique ON categories (slug);
