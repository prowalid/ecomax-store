const pool = require('../config/db');

const PUBLIC_SETTINGS_KEYS = new Set(['appearance', 'general', 'shipping', 'marketing']);
const PUBLIC_MARKETING_FIELDS = new Set(['pixel_id', 'pixel_configured', 'enabled_events', 'facebook_pixel_id']);

function getPublicMarketingSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([key]) => PUBLIC_MARKETING_FIELDS.has(key))
  );
}

// GET /api/settings/:key
async function getSettings(req, res, next) {
  const { key } = req.params;
  
  // Only explicitly-whitelisted keys are public. Everything else requires auth.
  if (!PUBLIC_SETTINGS_KEYS.has(key) && !req.user) {
    return res.status(403).json({ error: 'Access forbidden: sensitive configuration' });
  }

  if (!/^[a-z0-9_]+$/i.test(key)) {
    return res.status(400).json({ error: 'Invalid settings key' });
  }

  try {
    const { rows } = await pool.query('SELECT value FROM store_settings WHERE key = $1 LIMIT 1', [key]);
    
    if (rows.length === 0) {
      // Return empty if not found; seeds usually pre-populate it though
      return res.json({ value: {} });
    }

    if (key === 'marketing' && !req.user) {
      return res.json({ value: getPublicMarketingSettings(rows[0].value) });
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
