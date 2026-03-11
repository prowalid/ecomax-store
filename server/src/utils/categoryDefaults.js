const pool = require('../config/db');

const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1556910103-1c02745a8720?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1200",
];

async function ensureDefaultCategoryImages() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: settingRows } = await client.query(
      "SELECT value FROM store_settings WHERE key = 'category_image_defaults_seeded' LIMIT 1"
    );

    if (settingRows[0]?.value?.seeded === true) {
      await client.query('COMMIT');
      return;
    }

    const { rows: categories } = await client.query(`
      SELECT id, image_url
      FROM categories
      ORDER BY sort_order ASC, created_at ASC
      LIMIT 3
    `);

    for (let index = 0; index < categories.length; index += 1) {
      const category = categories[index];
      if (category.image_url) {
        continue;
      }

      await client.query(
        'UPDATE categories SET image_url = $1 WHERE id = $2',
        [DEFAULT_CATEGORY_IMAGES[index], category.id]
      );
    }

    await client.query(
      `
        INSERT INTO store_settings (key, value)
        VALUES ('category_image_defaults_seeded', $1::jsonb)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `,
      [JSON.stringify({ seeded: true })]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  ensureDefaultCategoryImages,
  DEFAULT_CATEGORY_IMAGES,
};
