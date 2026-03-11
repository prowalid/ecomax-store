const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const pool = require('../config/db');
const {
  clearAuthCookies,
  getCookieValue,
  setAuthCookies,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} = require('../utils/authCookies');
const { issueAuthTokens, verifyToken } = require('../utils/authTokens');
const {
  createAuthSession,
  revokeAuthSession,
  rotateAuthSession,
  validateRefreshSession,
} = require('../utils/authSessions');

async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, role, created_at FROM users WHERE id = $1',
    [id]
  );

  return rows[0] || null;
}

function getRequestMeta(req) {
  return {
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
  };
}

function getSessionIdFromRequest(req) {
  const tokenEntries = [
    { token: getCookieValue(req, REFRESH_COOKIE_NAME), type: 'refresh' },
    { token: getCookieValue(req, ACCESS_COOKIE_NAME), type: 'access' },
  ].filter((entry) => entry.token);

  for (const { token, type } of tokenEntries) {
    try {
      const decoded = verifyToken(token, type);
      if (decoded.sessionId) {
        return decoded.sessionId;
      }
    } catch (err) {
      // Ignore invalid cookie while attempting best-effort revocation.
    }
  }

  return null;
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if any admin already exists (registration locked after first admin)
    const { rows: existing } = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existing[0].count) > 0) {
      return res.status(403).json({ error: 'Registration is closed. An admin already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email.toLowerCase().trim(), passwordHash, 'admin']
    );

    const user = rows[0];

    const provisionalSessionId = randomUUID();
    const { accessToken, refreshToken, ttl } = issueAuthTokens(user, provisionalSessionId);
    await createAuthSession({
      userId: user.id,
      refreshToken,
      refreshTtlSeconds: ttl.refreshSeconds,
      ...getRequestMeta(req),
      sessionId: provisionalSessionId,
    });
    setAuthCookies(res, accessToken, refreshToken, ttl);

    res.status(201).json({
      message: 'Admin account created successfully.',
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const provisionalSessionId = randomUUID();
    const { accessToken, refreshToken, ttl } = issueAuthTokens(user, provisionalSessionId);
    await createAuthSession({
      userId: user.id,
      refreshToken,
      refreshTtlSeconds: ttl.refreshSeconds,
      ...getRequestMeta(req),
      sessionId: provisionalSessionId,
    });
    setAuthCookies(res, accessToken, refreshToken, ttl);

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
async function refresh(req, res, next) {
  try {
    const refreshToken = getCookieValue(req, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is missing.' });
    }

    const decoded = verifyToken(refreshToken, 'refresh');
    const session = await validateRefreshSession({
      sessionId: decoded.sessionId,
      userId: decoded.id,
      refreshToken,
    });
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh session is invalid or revoked.' });
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'User not found for refresh token.' });
    }

    const { accessToken, refreshToken: nextRefreshToken, ttl } = issueAuthTokens(user, decoded.sessionId);
    const rotatedSession = await rotateAuthSession({
      sessionId: decoded.sessionId,
      refreshToken: nextRefreshToken,
      refreshTtlSeconds: ttl.refreshSeconds,
      ...getRequestMeta(req),
    });
    if (!rotatedSession) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh session could not be rotated.' });
    }
    setAuthCookies(res, accessToken, nextRefreshToken, ttl);

    res.json({ user });
  } catch (err) {
    clearAuthCookies(res);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const sessionId = getSessionIdFromRequest(req);
    if (sessionId) {
      await revokeAuthSession(sessionId, 'logout');
    }
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/setup-status
async function checkSetupStatus(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    const hasAdmin = parseInt(rows[0].count) > 0;
    res.json({ hasAdmin });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, checkSetupStatus, refresh, logout };
