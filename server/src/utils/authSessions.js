const { createHash, randomUUID } = require('crypto');

const pool = require('../config/db');

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function sanitizeMeta(value) {
  return value ? String(value).slice(0, 512) : null;
}

function getSessionExpiryDate(ttlSeconds) {
  return new Date(Date.now() + ttlSeconds * 1000);
}

async function ensureAuthSessionsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ DEFAULT NULL,
      revoked_reason TEXT DEFAULT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
    ON auth_sessions (user_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_active
    ON auth_sessions (expires_at, revoked_at)
  `);
}

async function createAuthSession({ sessionId = randomUUID(), userId, refreshToken, refreshTtlSeconds, userAgent, ipAddress }) {

  await pool.query(
    `INSERT INTO auth_sessions (
      id, user_id, refresh_token_hash, user_agent, ip_address, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      sessionId,
      userId,
      hashToken(refreshToken),
      sanitizeMeta(userAgent),
      sanitizeMeta(ipAddress),
      getSessionExpiryDate(refreshTtlSeconds),
    ]
  );

  return sessionId;
}

async function getAuthSession(sessionId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, refresh_token_hash, expires_at, revoked_at
     FROM auth_sessions
     WHERE id = $1
     LIMIT 1`,
    [sessionId]
  );

  return rows[0] || null;
}

async function isAuthSessionActive(sessionId) {
  const { rows } = await pool.query(
    `SELECT 1
     FROM auth_sessions
     WHERE id = $1
       AND revoked_at IS NULL
       AND expires_at > now()
     LIMIT 1`,
    [sessionId]
  );

  return rows.length > 0;
}

async function rotateAuthSession({ sessionId, refreshToken, refreshTtlSeconds, userAgent, ipAddress }) {
  const { rows } = await pool.query(
    `UPDATE auth_sessions
     SET refresh_token_hash = $2,
         expires_at = $3,
         user_agent = COALESCE($4, user_agent),
         ip_address = COALESCE($5, ip_address),
         last_used_at = now(),
         updated_at = now()
     WHERE id = $1
       AND revoked_at IS NULL
     RETURNING id`,
    [
      sessionId,
      hashToken(refreshToken),
      getSessionExpiryDate(refreshTtlSeconds),
      sanitizeMeta(userAgent),
      sanitizeMeta(ipAddress),
    ]
  );

  return rows[0] || null;
}

async function revokeAuthSession(sessionId, reason = 'manual_logout') {
  const { rows } = await pool.query(
    `UPDATE auth_sessions
     SET revoked_at = now(),
         revoked_reason = $2,
         updated_at = now()
     WHERE id = $1
       AND revoked_at IS NULL
     RETURNING id`,
    [sessionId, reason]
  );

  return rows[0] || null;
}

async function validateRefreshSession({ sessionId, userId, refreshToken }) {
  const session = await getAuthSession(sessionId);
  if (!session) {
    return null;
  }

  if (session.user_id !== userId) {
    return null;
  }

  if (session.revoked_at || new Date(session.expires_at).getTime() <= Date.now()) {
    return null;
  }

  if (session.refresh_token_hash !== hashToken(refreshToken)) {
    return null;
  }

  return session;
}

module.exports = {
  ensureAuthSessionsTable,
  createAuthSession,
  isAuthSessionActive,
  rotateAuthSession,
  revokeAuthSession,
  validateRefreshSession,
};
