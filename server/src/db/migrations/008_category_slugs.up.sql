ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug TEXT;

DO $$
DECLARE
  category_record RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  suffix INTEGER;
BEGIN
  FOR category_record IN
    SELECT id, name
    FROM categories
    WHERE slug IS NULL OR btrim(slug) = ''
    ORDER BY id
  LOOP
    base_slug := lower(
      regexp_replace(
        regexp_replace(
          regexp_replace(btrim(COALESCE(category_record.name, '')), '[^[:alnum:][:space:]-]+', '', 'g'),
          '[[:space:]]+',
          '-',
          'g'
        ),
        '-+',
        '-',
        'g'
      )
    );

    base_slug := btrim(base_slug, '-');

    IF base_slug IS NULL OR base_slug = '' THEN
      base_slug := 'category';
    END IF;

    candidate_slug := base_slug;
    suffix := 2;

    WHILE EXISTS (
      SELECT 1
      FROM categories
      WHERE slug = candidate_slug
        AND id <> category_record.id
    ) LOOP
      candidate_slug := base_slug || '-' || suffix;
      suffix := suffix + 1;
    END LOOP;

    UPDATE categories
    SET slug = candidate_slug
    WHERE id = category_record.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_unique ON categories (slug);
