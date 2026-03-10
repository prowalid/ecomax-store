const pool = require('../config/db');

// GET /api/pages
// Used by admin to fetch all pages
async function getAllPages(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM pages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/pages/published/:placement
// Used by storefront to fetch links for header or footer
async function getPublishedPages(req, res, next) {
  const { placement } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT id, title, slug, show_in 
      FROM pages 
      WHERE published = true 
      AND show_in IN ($1, 'both')
      ORDER BY created_at ASC
    `, [placement]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/pages/slug/:slug
// Used by storefront to view a specific page
async function getPageBySlug(req, res, next) {
  const { slug } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT * FROM pages 
      WHERE slug = $1 AND published = true 
      LIMIT 1
    `, [slug]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/pages
async function createPage(req, res, next) {
  try {
    const { title, slug, content, published, show_in } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO pages (title, slug, content, published, show_in)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, slug, content || '', published || false, show_in || 'none']);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/pages/:id
async function updatePage(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const allowedFields = ['title', 'slug', 'content', 'published', 'show_in'];
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
    
    setClause.push(`updated_at = $${queryIndex}`);
    values.push(new Date().toISOString());
    queryIndex++;

    values.push(id);

    const query = `
      UPDATE pages 
      SET ${setClause.join(', ')} 
      WHERE id = $${queryIndex} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/pages/:id
async function deletePage(req, res, next) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM pages WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getAllPages, 
  getPublishedPages, 
  getPageBySlug, 
  createPage, 
  updatePage, 
  deletePage 
};
