const pool = require('../config/db');

// GET /api/settings/:key
async function getSettings(req, res, next) {
  const { key } = req.params;
  
  // Security Hardening (Codex BE-SEC-01)
  // Prevent public visitors from scraping API keys
  const sensitiveKeys = ['notifications', 'integrations', 'payment'];
  if (sensitiveKeys.includes(key)) {
    if (!req.user) {
      return res.status(403).json({ error: 'Access forbidden: sensitive configuration' });
    }
  }

  try {
    const { rows } = await pool.query('SELECT value FROM store_settings WHERE key = $1 LIMIT 1', [key]);
    
    if (rows.length === 0) {
      // Return empty if not found; seeds usually pre-populate it though
      return res.json({ value: {} });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings/:key
// Upserts the JSONB value
async function saveSettings(req, res, next) {
  const { key } = req.params;
  const { value } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE 
      SET value = store_settings.value || EXCLUDED.value, updated_at = EXCLUDED.updated_at
      RETURNING value
    `, [key, value, new Date().toISOString()]);
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, saveSettings };
