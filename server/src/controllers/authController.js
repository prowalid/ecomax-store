const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const crypto = require('crypto');
const otplib = require('otplib');
const qrcode = require('qrcode');
const pool = require('../config/db');
const { sendWhatsAppInternal } = require('./integrationsController');
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

async function getTwoFactorIssuer() {
  try {
    const { rows } = await pool.query(
      "SELECT value FROM store_settings WHERE key = 'general' LIMIT 1"
    );
    const settings = rows[0]?.value || {};
    const storeName = String(settings.store_name || '').trim();
    return storeName || 'ECOMAX';
  } catch {
    return 'ECOMAX';
  }
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
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role, two_factor_enabled, two_factor_secret FROM users WHERE email = $1',
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

    // Verify 2FA if enabled
    if (user.two_factor_enabled) {
      if (!twoFactorCode) {
        return res.status(403).json({ error: 'Two-factor authentication code required.', requires_2fa: true });
      }
      
      const isValid2FA = otplib.authenticator.check(twoFactorCode, user.two_factor_secret);
      if (!isValid2FA) {
        return res.status(401).json({ error: 'Invalid two-factor authentication code.' });
      }
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
      user: { id: user.id, email: user.email, role: user.role, two_factor_enabled: user.two_factor_enabled },
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

// GET /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, two_factor_enabled FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone, role, two_factor_enabled',
      [name, email, phone, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email or phone already exists.' });
    next(err);
  }
}

// POST /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Invalid password data.' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة.' });

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);
    res.json({ message: 'تم تغيير كلمة المرور بنجاح.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/2fa/setup
async function setup2FA(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
    const secret = otplib.authenticator.generateSecret();
    const issuer = await getTwoFactorIssuer();
    const otpauthUrl = otplib.authenticator.keyuri(rows[0].email, issuer, secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    
    await pool.query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret, req.user.id]);
    
    res.json({ secret, qrCodeUrl });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/2fa/verify
async function verify2FA(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required.' });

    const { rows } = await pool.query('SELECT two_factor_secret FROM users WHERE id = $1', [req.user.id]);
    const secret = rows[0].two_factor_secret;

    if (!secret) return res.status(400).json({ error: '2FA is not setup.' });

    const isValid = otplib.authenticator.check(code, secret);
    if (!isValid) return res.status(400).json({ error: 'كود التحقق غير صحيح.' });

    await pool.query('UPDATE users SET two_factor_enabled = true WHERE id = $1', [req.user.id]);
    res.json({ message: 'تم تفعيل المصادقة الثنائية بنجاح.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/2fa/disable
async function disable2FA(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required.' });

    const { rows } = await pool.query('SELECT two_factor_secret FROM users WHERE id = $1', [req.user.id]);
    const secret = rows[0].two_factor_secret;

    const isValid = otplib.authenticator.check(code, secret);
    if (!isValid) return res.status(400).json({ error: 'كود التحقق غير صحيح.' });

    await pool.query('UPDATE users SET two_factor_enabled = false, two_factor_secret = null WHERE id = $1', [req.user.id]);
    res.json({ message: 'تم تعطيل المصادقة الثنائية.' });
  } catch (err) {
    next(err);
  }
}

// Password Recovery Helpers (Mock Green API Send via console + db store)
async function recoverPassword(req, res, next) {
  try {
    const { phone } = req.body;
    const { rows } = await pool.query('SELECT id, name FROM users WHERE phone = $1', [phone]);
    if (rows.length === 0) return res.status(404).json({ error: 'لا يوجد حساب مرتبط بهذا الرقم.' });

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins

    await pool.query('UPDATE users SET recovery_code = $1, recovery_code_expires_at = $2 WHERE id = $3', [code, expiresAt.toISOString(), rows[0].id]);

    const result = await sendWhatsAppInternal({
      template: 'custom',
      phone,
      data: {
        message: `🔐 *استعادة كلمة المرور*\n\nمرحباً ${rows[0].name || 'مدير المتجر'}\nكود الاسترداد الخاص بك هو:\n\n*${code}*\n\nصلاحية الكود: 15 دقيقة.\nإذا لم تطلب هذا الإجراء فتجاهل الرسالة.`,
      },
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error || 'فشل إرسال كود الاسترداد عبر واتساب.' });
    }

    res.json({ message: 'تم إرسال كود الاسترداد إلى رقمك في واتساب.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { phone, code, newPassword } = req.body;
    const { rows } = await pool.query(
      'SELECT id, recovery_code, recovery_code_expires_at FROM users WHERE phone = $1',
      [phone]
    );

    if (rows.length === 0) return res.status(400).json({ error: 'Invalid request.' });
    const user = rows[0];

    if (!user.recovery_code || user.recovery_code !== code || new Date() > new Date(user.recovery_code_expires_at)) {
      return res.status(400).json({ error: 'الكود خاطئ أو منتهي الصلاحية.' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1, recovery_code = null, recovery_code_expires_at = null WHERE id = $2', [newHash, user.id]);
    
    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  register, login, getMe, checkSetupStatus, refresh, logout,
  getProfile, updateProfile, changePassword,
  setup2FA, verify2FA, disable2FA,
  recoverPassword, resetPassword
};
