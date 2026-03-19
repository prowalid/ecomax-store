const { ICategoryRepository } = require('../../domain/repositories/ICategoryRepository');
const { ConflictError } = require('../../domain/errors/ConflictError');

class PgCategoryRepository extends ICategoryRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findAll() {
    const result = await this.pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
    return result.rows;
  }

  async findBySlug(slug) {
    const result = await this.pool.query(
      'SELECT * FROM categories WHERE slug = $1 LIMIT 1',
      [slug]
    );

    return result.rows[0] ?? null;
  }

  async findBySlugExcludingId(slug, id) {
    const result = await this.pool.query(
      'SELECT id FROM categories WHERE slug = $1 AND id <> $2 LIMIT 1',
      [slug, id]
    );

    return result.rows[0] ?? null;
  }

  async findById(id) {
    const result = await this.pool.query(
      'SELECT * FROM categories WHERE id = $1 LIMIT 1',
      [id]
    );

    return result.rows[0] ?? null;
  }

  async create({ name, slug, sort_order, image_url }) {
    const payload = typeof name === 'object' && name !== null
      ? name.toPersistence()
      : { name, slug, sort_order, image_url };

    const result = await this.pool.query(
      `
        INSERT INTO categories (name, slug, sort_order, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [payload.name, payload.slug, payload.sort_order, payload.image_url]
    );

    return result.rows[0];
  }

  async update(id, updates, expectedVersion) {
    const payload = typeof updates?.toPersistence === 'function'
      ? updates.toPersistence()
      : updates;
    const allowedFields = ['name', 'slug', 'sort_order', 'image_url'];
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

    setClause.push('version = version + 1');
    values.push(id);
    queryIndex++;
    values.push(expectedVersion);

    const result = await this.pool.query(
      `
        UPDATE categories
        SET ${setClause.join(', ')}
        WHERE id = $${queryIndex - 1}
          AND version = $${queryIndex}
        RETURNING *
      `,
      values
    );

    if (result.rowCount === 0) {
      throw new ConflictError('تم تعديل التصنيف من مكان آخر. أعد تحميل القائمة ثم حاول مرة أخرى.');
    }
    return result.rows[0] ?? null;
  }

  async delete(id) {
    const result = await this.pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING image_url',
      [id]
    );

    return result.rows[0] ?? null;
  }
}

module.exports = {
  PgCategoryRepository,
};
