const format = require('pg-format');
const { IProductRepository } = require('../../domain/repositories/IProductRepository');
const { ConflictError } = require('../../domain/errors/ConflictError');

class PgProductRepository extends IProductRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async list({ isAdmin }) {
    const query = isAdmin
      ? `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `
      : `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
      `;

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async findById(productId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM products WHERE id = $1 LIMIT 1',
      [productId]
    );

    return rows[0] || null;
  }

  async create(data) {
    const payload = typeof data?.toPersistence === 'function'
      ? data.toPersistence()
      : data;

    const { rows } = await this.pool.query(`
      INSERT INTO products
        (name, description, price, compare_price, cost_price, stock, sku, category_id, image_url, custom_options, status)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      payload.name,
      payload.description,
      payload.price,
      payload.compare_price,
      payload.cost_price,
      payload.stock,
      payload.sku,
      payload.category_id || null,
      payload.image_url,
      JSON.stringify(payload.custom_options || []),
      payload.status || 'active',
    ]);

    return rows[0];
  }

  async getImageSnapshot(productId) {
    const { rows } = await this.pool.query(
      'SELECT image_url FROM products WHERE id = $1 LIMIT 1',
      [productId]
    );

    return rows[0] || null;
  }

  async update(productId, updates, expectedVersion) {
    const payload = typeof updates?.toPersistence === 'function'
      ? updates.toPersistence()
      : updates;
    const allowedFields = [
      'name',
      'description',
      'price',
      'compare_price',
      'cost_price',
      'stock',
      'sku',
      'category_id',
      'image_url',
      'custom_options',
      'status',
    ];

    const setClause = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(payload)) {
      if (!allowedFields.includes(key)) continue;

      setClause.push(`${key} = $${queryIndex}`);
      values.push(key === 'custom_options' ? JSON.stringify(value) : value);
      queryIndex += 1;
    }

    if (setClause.length === 0) {
      return null;
    }

    setClause.push(`updated_at = $${queryIndex}`);
    values.push(new Date().toISOString());
    queryIndex += 1;
    setClause.push('version = version + 1');
    values.push(productId);
    queryIndex += 1;
    values.push(expectedVersion);

    const query = `
      UPDATE products
      SET ${setClause.join(', ')}
      WHERE id = $${queryIndex - 1}
        AND version = $${queryIndex}
      RETURNING *
    `;

    const { rows, rowCount } = await this.pool.query(query, values);
    if (rowCount === 0) {
      throw new ConflictError('تم تعديل المنتج من مكان آخر. أعد تحميل القائمة ثم حاول مرة أخرى.');
    }
    return rows[0] || null;
  }

  async getDeleteSnapshot(productId) {
    const { rows: productRows } = await this.pool.query(
      'SELECT image_url FROM products WHERE id = $1 LIMIT 1',
      [productId]
    );

    if (productRows.length === 0) {
      return null;
    }

    const { rows: imageRows } = await this.pool.query(
      'SELECT image_url FROM product_images WHERE product_id = $1',
      [productId]
    );

    return {
      image_url: productRows[0].image_url,
      gallery_urls: imageRows.map((row) => row.image_url),
    };
  }

  async delete(productId) {
    const { rowCount } = await this.pool.query('DELETE FROM products WHERE id = $1', [productId]);
    return rowCount > 0;
  }

  async listImages(productId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC',
      [productId]
    );

    return rows;
  }

  async addImage(productId, imageUrl) {
    const { rows: existing } = await this.pool.query(
      'SELECT sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order DESC LIMIT 1',
      [productId]
    );

    const nextOrder = (existing.length > 0 ? existing[0].sort_order : -1) + 1;
    const { rows } = await this.pool.query(
      `
        INSERT INTO product_images (product_id, image_url, sort_order)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [productId, imageUrl, nextOrder]
    );

    if (nextOrder === 0) {
      await this.pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [imageUrl, productId]);
    }

    return rows[0];
  }

  async reorderImages(productId, images) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const values = images.map((image) => [image.id, image.sort_order]);
      const query = format(`
        UPDATE product_images AS p
        SET sort_order = v.sort_order::int
        FROM (VALUES %L) AS v(id, sort_order)
        WHERE p.id = v.id::uuid
      `, values);

      await client.query(query);

      if (images.length > 0) {
        const first = images.reduce((a, b) => (a.sort_order < b.sort_order ? a : b));
        await client.query('UPDATE products SET image_url = $1 WHERE id = $2', [first.image_url, productId]);
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteImage(productId, imageId) {
    const { rows: deletedRows } = await this.pool.query(
      'DELETE FROM product_images WHERE id = $1 AND product_id = $2 RETURNING image_url',
      [imageId, productId]
    );

    if (deletedRows.length === 0) {
      return null;
    }

    const { rows: remaining } = await this.pool.query(
      'SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC LIMIT 1',
      [productId]
    );

    const newMainImage = remaining.length > 0 ? remaining[0].image_url : null;
    await this.pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [newMainImage, productId]);

    return {
      deletedImageUrl: deletedRows[0].image_url,
      newMainImage,
    };
  }
}

module.exports = {
  PgProductRepository,
};
