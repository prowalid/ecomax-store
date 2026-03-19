const { normalizeSlug } = require('../../utils/slug');

class PageIntegrityService {
  constructor({ pool }) {
    this.pool = pool;
  }

  async ensureUniqueNormalizedSlugs() {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        'SELECT id, slug FROM pages ORDER BY created_at ASC, id ASC'
      );

      const used = new Set();

      for (const page of rows) {
        const base = normalizeSlug(page.slug);
        if (!base) {
          continue;
        }

        let candidate = base;
        let suffix = 2;

        while (used.has(candidate)) {
          candidate = `${base}-${suffix}`;
          suffix += 1;
        }

        used.add(candidate);

        if (candidate !== page.slug) {
          await client.query(
            'UPDATE pages SET slug = $1, updated_at = NOW() WHERE id = $2',
            [candidate, page.id]
          );
        }
      }

      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_slug_unique ON pages (slug)');
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = {
  PageIntegrityService,
};
