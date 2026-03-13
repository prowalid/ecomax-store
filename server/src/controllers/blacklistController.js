const pool = require('../config/db');

// GET /api/blacklist
async function getBlacklist(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM blacklist ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/blacklist
async function addToBlacklist(req, res, next) {
  const { type, value, reason } = req.body;

  if (!type || !value) {
    return res.status(400).json({ error: 'Type and value are required' });
  }

  if (!['phone', 'ip'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be phone or ip' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO blacklist (type, value, reason) VALUES ($1, $2, $3) ON CONFLICT (type, value) DO UPDATE SET reason = EXCLUDED.reason RETURNING *',
      [type, value, reason]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/blacklist/:id
async function removeFromBlacklist(req, res, next) {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM blacklist WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist
};
