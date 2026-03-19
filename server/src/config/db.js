const { Pool } = require('pg');

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
  if (value == null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const isProduction = process.env.NODE_ENV === 'production';
const sslEnabled = parseBoolean(process.env.DB_SSL, isProduction);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseNumber(process.env.DB_PORT, 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseNumber(process.env.DB_POOL_MAX, 20),
  min: parseNumber(process.env.DB_POOL_MIN, 2),
  idleTimeoutMillis: parseNumber(process.env.DB_IDLE_TIMEOUT_MS, 30_000),
  connectionTimeoutMillis: parseNumber(process.env.DB_CONNECTION_TIMEOUT_MS, 5_000),
  keepAlive: true,
  application_name: process.env.DB_APPLICATION_NAME || 'ecomax-store-api',
  ...(sslEnabled
    ? {
      ssl: {
        rejectUnauthorized: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
      },
    }
    : {}),
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
