const pool = require('../config/db');
const { collectAppearanceUploadUrls, cleanupRemovedUploadUrls } = require('../utils/uploadCleanup');

const PUBLIC_SETTINGS_KEYS = new Set(['appearance', 'general', 'shipping', 'marketing', 'security']);
const PUBLIC_MARKETING_FIELDS = new Set(['pixel_id', 'pixel_configured', 'enabled_events', 'facebook_pixel_id']);
const PUBLIC_SECURITY_FIELDS = new Set(['turnstile_enabled', 'site_key', 'honeypot_enabled']);
const WHATSAPP_ALLOWED_PATTERN = /^[0-9+\-\s()]+$/;

function normalizeWhatsAppPhone(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  let digits = raw.replace(/[^\d+]/g, '').replace(/\+/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length === 10) {
    digits = `213${digits.slice(1)}`;
  } else if (digits.length === 9 && !digits.startsWith('213')) {
    digits = `213${digits}`;
  }

  if (!/^\d{8,15}$/.test(digits)) {
    return null;
  }

  return digits;
}

function sanitizeGeneralSettingsValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Invalid general settings payload' };
  }

  const nextValue = { ...value };

  if (Object.prototype.hasOwnProperty.call(nextValue, 'whatsapp_phone')) {
    const raw = String(nextValue.whatsapp_phone || '').trim();
    if (!raw) {
      nextValue.whatsapp_phone = '';
      return { ok: true, value: nextValue };
    }

    if (!WHATSAPP_ALLOWED_PATTERN.test(raw)) {
      return { ok: false, error: 'Invalid WhatsApp phone format' };
    }

    const normalized = normalizeWhatsAppPhone(raw);
    if (!normalized) {
      return { ok: false, error: 'Invalid WhatsApp phone format' };
    }

    nextValue.whatsapp_phone = `+${normalized}`;
  }

  return { ok: true, value: nextValue };
}

function getPublicMarketingSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([key]) => PUBLIC_MARKETING_FIELDS.has(key))
  );
}

function getPublicSecuritySettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([key]) => PUBLIC_SECURITY_FIELDS.has(key))
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

    if (key === 'security' && !req.user) {
      return res.json({ value: getPublicSecuritySettings(rows[0].value) });
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
  let { value } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  if (key === 'general') {
    const sanitized = sanitizeGeneralSettingsValue(value);
    if (!sanitized.ok) {
      return res.status(400).json({ error: sanitized.error });
    }
    value = sanitized.value;
  }

  try {
    let previousAppearanceUrls = [];
    if (key === 'appearance') {
      const { rows: existingRows } = await pool.query('SELECT value FROM store_settings WHERE key = $1 LIMIT 1', [key]);
      previousAppearanceUrls = collectAppearanceUploadUrls(existingRows[0]?.value);
    }

    const { rows } = await pool.query(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE 
      SET value = store_settings.value || EXCLUDED.value, updated_at = EXCLUDED.updated_at
      RETURNING value
    `, [key, value, new Date().toISOString()]);
    
    if (key === 'appearance') {
      const nextAppearanceUrls = collectAppearanceUploadUrls(rows[0].value);
      await cleanupRemovedUploadUrls(previousAppearanceUrls, nextAppearanceUrls);
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, saveSettings };
