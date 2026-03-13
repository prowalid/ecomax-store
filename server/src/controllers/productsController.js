const pool = require('../config/db');
const format = require('pg-format');

function normalizeCustomOptions(input) {
  if (!Array.isArray(input)) return [];

  return input
    .map((group) => {
      if (!group || typeof group !== 'object') return null;
      const name = typeof group.name === 'string' ? group.name.trim() : '';
      const values = Array.isArray(group.values)
        ? group.values
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
        : [];

      if (!name || values.length === 0) return null;
      return { name, values: Array.from(new Set(values)) };
    })
    .filter(Boolean);
}

// GET /api/products
async function getProducts(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'admin';
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

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/products
async function createProduct(req, res, next) {
  try {
    const { name, description, price, compare_price, cost_price, stock, sku, category_id, image_url, custom_options, status } = req.body;

    const { rows } = await pool.query(`
      INSERT INTO products 
        (name, description, price, compare_price, cost_price, stock, sku, category_id, image_url, custom_options, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [name, description, price, compare_price, cost_price, stock, sku, category_id || null, image_url, JSON.stringify(normalizeCustomOptions(custom_options)), status || 'active']);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/products/:id
async function updateProduct(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const allowedFields = ['name', 'description', 'price', 'compare_price', 'cost_price', 'stock', 'sku', 'category_id', 'image_url', 'custom_options', 'status'];
    const setClause = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) continue;
      setClause.push(`${key} = $${queryIndex}`);
      values.push(key === 'custom_options' ? JSON.stringify(normalizeCustomOptions(value)) : value);
      queryIndex++;
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    setClause.push(`updated_at = $${queryIndex}`);
    values.push(new Date().toISOString());
    queryIndex++;

    values.push(id);

    const query = `
      UPDATE products 
      SET ${setClause.join(', ')} 
      WHERE id = $${queryIndex} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res, next) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id/images
async function getProductImages(req, res, next) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC', [id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/products/:id/images
async function addProductImage(req, res, next) {
  const { id } = req.params;
  const { image_url } = req.body;

  try {
    const { rows: existing } = await pool.query(
      'SELECT sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order DESC LIMIT 1', 
      [id]
    );
    const nextOrder = (existing.length > 0 ? existing[0].sort_order : -1) + 1;

    const { rows } = await pool.query(`
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, image_url, nextOrder]);

    if (nextOrder === 0) {
      await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [image_url, id]);
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id/images/reorder
async function reorderProductImages(req, res, next) {
  const { id } = req.params;
  const { images } = req.body; // array of { id, sort_order, image_url }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Bulk update using pg-format
    const values = images.map(img => [img.id, img.sort_order]);
    const query = format(`
      UPDATE product_images AS p 
      SET sort_order = v.sort_order::int
      FROM (VALUES %L) AS v(id, sort_order)
      WHERE p.id = v.id::uuid
    `, values);
    
    await client.query(query);

    if (images.length > 0) {
      const first = images.reduce((a, b) => (a.sort_order < b.sort_order ? a : b));
      await client.query('UPDATE products SET image_url = $1 WHERE id = $2', [first.image_url, id]);
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// DELETE /api/products/:id/images/:imageId
async function deleteProductImage(req, res, next) {
  const { id, imageId } = req.params;
  try {
    await pool.query('DELETE FROM product_images WHERE id = $1', [imageId]);

    const { rows: remaining } = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC LIMIT 1',
      [id]
    );

    const newMainImage = remaining.length > 0 ? remaining[0].image_url : null;
    await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [newMainImage, id]);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductImages, 
  addProductImage, 
  reorderProductImages, 
  deleteProductImage 
};
