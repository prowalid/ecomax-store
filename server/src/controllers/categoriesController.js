const pool = require('../config/db');
const { normalizeSlug } = require('../utils/slug');
const { cleanupRemovedUploadUrls } = require('../utils/uploadCleanup');

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/categories
async function createCategory(req, res, next) {
  try {
    const { name, slug, sort_order, image_url } = req.body;
    const normalizedSlug = normalizeSlug(slug) || null;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (normalizedSlug) {
      const { rows: existing } = await pool.query(
        'SELECT id FROM categories WHERE slug = $1 LIMIT 1',
        [normalizedSlug]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Category slug already exists' });
      }
    }

    const { rows } = await pool.query(`
      INSERT INTO categories (name, slug, sort_order, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, normalizedSlug, sort_order || 0, image_url || null]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/categories/:id
async function updateCategory(req, res, next) {
  const { id } = req.params;
  const updates = { ...req.body };
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const { rows: existingRows } = await pool.query('SELECT image_url FROM categories WHERE id = $1 LIMIT 1', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const previousImageUrl = existingRows[0].image_url;
    if (updates.slug !== undefined) {
      updates.slug = normalizeSlug(updates.slug) || null;

      if (updates.slug) {
        const { rows: existing } = await pool.query(
          'SELECT id FROM categories WHERE slug = $1 AND id <> $2 LIMIT 1',
          [updates.slug, id]
        );

        if (existing.length > 0) {
          return res.status(409).json({ error: 'Category slug already exists' });
        }
      }
    }

    const allowedFields = ['name', 'slug', 'sort_order', 'image_url'];
    const setClause = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) continue;
      setClause.push(`${key} = $${queryIndex}`);
      values.push(value);
      queryIndex++;
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const query = `
      UPDATE categories 
      SET ${setClause.join(', ')} 
      WHERE id = $${queryIndex} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    
    await cleanupRemovedUploadUrls([previousImageUrl], [rows[0].image_url]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res, next) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING image_url', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await cleanupRemovedUploadUrls([rows[0].image_url], []);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
