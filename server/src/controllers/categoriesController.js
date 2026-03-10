const pool = require('../config/db');

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
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO categories (name, slug, sort_order, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, slug || null, sort_order || 0, image_url || null]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/categories/:id
async function updateCategory(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
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
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res, next) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
