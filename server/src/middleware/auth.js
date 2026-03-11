const jwt = require('jsonwebtoken');
const { getCookieValue, ACCESS_COOKIE_NAME } = require('../utils/authCookies');
const { isAuthSessionActive } = require('../utils/authSessions');

function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}

function extractToken(req) {
  return getCookieValue(req, ACCESS_COOKIE_NAME) || extractBearerToken(req);
}

async function authMiddleware(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type.' });
    }
    if (!decoded.sessionId || !(await isAuthSessionActive(decoded.sessionId))) {
      return res.status(401).json({ error: 'Session is no longer active.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

async function optionalAuthMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const token = extractToken(req);

  // Skip silently for public callers; attach user only when a valid token is present.
  if (!token || !secret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (
      (!decoded.type || decoded.type === 'access') &&
      decoded.sessionId &&
      (await isAuthSessionActive(decoded.sessionId))
    ) {
      req.user = decoded;
    }
  } catch (err) {
    // Keep request public if token is invalid; protected routes still use authMiddleware.
  }
  next();
}

module.exports = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;
