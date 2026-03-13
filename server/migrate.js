require('dotenv').config();
const pool = require('./src/config/db');

async function migrate() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_code TEXT;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_code_expires_at TIMESTAMPTZ;');
        console.log("Migration successful");
    } catch (e) {
        console.error("Migration failed", e);
    } finally {
        pool.end();
    }
}

migrate();
