const format = require('pg-format');
const { IProductRepository } = require('../../domain/repositories/IProductRepository');
const { ConflictError } = require('../../domain/errors/ConflictError');

class PgProductRepository extends IProductRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async list({ isAdmin, search, categoryId, sort, inStockOnly, onSaleOnly, status, page, limit, paginate }) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (!isAdmin) {
      conditions.push(`p.status = 'active'`);
    }

    if (isAdmin && status) {
      conditions.push(`p.status = $${index}`);
      values.push(status);
      index += 1;
    }

    if (categoryId) {
      conditions.push(`p.category_id = $${index}`);
      values.push(categoryId);
      index += 1;
    }

    if (search) {
      conditions.push(`(
        p.name ILIKE $${index}
        OR COALESCE(p.description, '') ILIKE $${index}
        OR COALESCE(p.sku, '') ILIKE $${index}
        OR COALESCE(c.name, '') ILIKE $${index}
      )`);
      values.push(`%${search}%`);
      index += 1;
    }

    if (inStockOnly) {
      conditions.push('p.stock > 0');
    }

    if (onSaleOnly) {
      conditions.push('p.compare_price IS NOT NULL AND p.compare_price > p.price');
    }

    const orderBy = this.#resolveSort(sort);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const query = `
      SELECT p.*, c.name as category_name
      ${baseQuery}
      ORDER BY ${orderBy}
    `;

    if (paginate) {
      const safePage = Math.max(1, Number(page) || 1);
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
      const offset = (safePage - 1) * safeLimit;
      const paginatedQuery = `${query} LIMIT $${index} OFFSET $${index + 1}`;
      const paginatedValues = [...values, safeLimit, offset];
      const countQuery = `SELECT COUNT(*)::int AS total ${baseQuery}`;

      const [{ rows }, countResult] = await Promise.all([
        this.pool.query(paginatedQuery, paginatedValues),
        this.pool.query(countQuery, values),
      ]);

      const total = Number(countResult.rows[0]?.total ?? 0);
      return {
        items: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.max(1, Math.ceil(total / safeLimit)),
          hasNextPage: safePage * safeLimit < total,
          hasPreviousPage: safePage > 1,
        },
      };
    }

    const { rows } = await this.pool.query(query, values);
    return rows;
  }

  #resolveSort(sort) {
    switch (sort) {
      case 'price_asc':
        return 'p.price ASC, p.created_at DESC';
      case 'price_desc':
        return 'p.price DESC, p.created_at DESC';
      case 'name_asc':
        return 'p.name ASC, p.created_at DESC';
      case 'discount_desc':
        return `
          CASE
            WHEN p.compare_price IS NOT NULL AND p.compare_price > p.price
              THEN ((p.compare_price - p.price) / NULLIF(p.compare_price, 0))
            ELSE 0
          END DESC,
          p.created_at DESC
        `;
      case 'newest':
      default:
        return 'p.created_at DESC';
    }
  }

  async findById(productId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM products WHERE id = $1 LIMIT 1',
      [productId]
    );

    return rows[0] || null;
  }

  async findBySlug(slug) {
    const { rows } = await this.pool.query(
      'SELECT * FROM products WHERE slug = $1 LIMIT 1',
      [slug]
    );

    return rows[0] || null;
  }

  async findBySlugExcludingId(slug, productId) {
    const { rows } = await this.pool.query(
      'SELECT id FROM products WHERE slug = $1 AND id <> $2 LIMIT 1',
      [slug, productId]
    );

    return rows[0] || null;
  }

  async create(data) {
    const payload = typeof data?.toPersistence === 'function'
      ? data.toPersistence()
      : data;

    const { rows } = await this.pool.query(`
      INSERT INTO products
        (name, slug, description, price, compare_price, cost_price, stock, sku, category_id, image_url, custom_options, status)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      payload.name,
      payload.slug,
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
      'slug',
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
