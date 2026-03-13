const pool = require('../config/db');

async function ensureOrderSecuritySchema() {
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_options JSONB NOT NULL DEFAULT '[]'::jsonb");
  await pool.query("ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selected_options JSONB NOT NULL DEFAULT '{}'::jsonb");
  await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address TEXT');
  await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_options JSONB NOT NULL DEFAULT '{}'::jsonb");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blacklist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL CHECK (type IN ('ip', 'phone')),
      value TEXT NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_blacklist_type_value_unique ON blacklist(type, value)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_blacklist_value ON blacklist(value)');
}

module.exports = {
  ensureOrderSecuritySchema,
};
