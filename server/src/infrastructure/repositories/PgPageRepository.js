const { IPageRepository } = require('../../domain/repositories/IPageRepository');
const { ConflictError } = require('../../domain/errors/ConflictError');

class PgPageRepository extends IPageRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findAll() {
    const result = await this.pool.query('SELECT * FROM pages ORDER BY created_at DESC');
    return result.rows;
  }

  async findPublishedByPlacement(placement) {
    const result = await this.pool.query(
      `
        SELECT id, title, slug, show_in
        FROM pages
        WHERE published = true
        AND show_in IN ($1, 'both')
        ORDER BY created_at ASC
      `,
      [placement]
    );

    return result.rows;
  }

  async findPublishedBySlug(slug) {
    const result = await this.pool.query(
      `
        SELECT * FROM pages
        WHERE slug = $1 AND published = true
        LIMIT 1
      `,
      [slug]
    );

    return result.rows[0] ?? null;
  }

  async findById(id) {
    const result = await this.pool.query(
      'SELECT * FROM pages WHERE id = $1 LIMIT 1',
      [id]
    );

    return result.rows[0] ?? null;
  }

  async findBySlug(slug) {
    const result = await this.pool.query(
      'SELECT * FROM pages WHERE slug = $1 LIMIT 1',
      [slug]
    );

    return result.rows[0] ?? null;
  }

  async findBySlugExcludingId(slug, id) {
    const result = await this.pool.query(
      'SELECT id FROM pages WHERE slug = $1 AND id <> $2 LIMIT 1',
      [slug, id]
    );

    return result.rows[0] ?? null;
  }

  async create({ title, slug, content, published, show_in }) {
    const payload = typeof title === 'object' && title !== null
      ? title.toPersistence()
      : { title, slug, content, published, show_in };

    const result = await this.pool.query(
      `
        INSERT INTO pages (title, slug, content, published, show_in)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [payload.title, payload.slug, payload.content, payload.published, payload.show_in]
    );

    return result.rows[0];
  }

  async update(id, updates, expectedVersion) {
    const payload = typeof updates?.toPersistence === 'function'
      ? updates.toPersistence()
      : updates;
    const allowedFields = ['title', 'slug', 'content', 'published', 'show_in'];
    const setClause = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(payload)) {
      if (!allowedFields.includes(key)) continue;
      setClause.push(`${key} = $${queryIndex}`);
      values.push(value);
      queryIndex++;
    }

    if (setClause.length === 0) {
      return { type: 'invalid' };
    }

    setClause.push(`updated_at = $${queryIndex}`);
    values.push(new Date().toISOString());
    queryIndex++;
    setClause.push('version = version + 1');
    values.push(id);
    queryIndex++;
    values.push(expectedVersion);

    const result = await this.pool.query(
      `
        UPDATE pages
        SET ${setClause.join(', ')}
        WHERE id = $${queryIndex - 1}
          AND version = $${queryIndex}
        RETURNING *
      `,
      values
    );

    if (result.rowCount === 0) {
      throw new ConflictError('تم تعديل الصفحة من مكان آخر. أعد تحميل القائمة ثم حاول مرة أخرى.');
    }
    return result.rows[0] ?? null;
  }

  async delete(id) {
    const result = await this.pool.query('DELETE FROM pages WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = {
  PgPageRepository,
};
