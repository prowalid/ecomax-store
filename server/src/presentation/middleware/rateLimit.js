const rateLimitConfig = require('../../config/rateLimit');
const { InMemoryRateLimitStore } = require('../../infrastructure/rate-limit/InMemoryRateLimitStore');

let store = null;

function createStore() {
  if (rateLimitConfig.driver === 'redis') {
    try {
      const { RedisRateLimitStore } = require('../../infrastructure/rate-limit/RedisRateLimitStore');
      return new RedisRateLimitStore(rateLimitConfig.redis);
    } catch (error) {
      console.warn(`[RateLimit] Redis store unavailable, falling back to memory: ${error.message}`);
    }
  }

  return new InMemoryRateLimitStore();
}

function getStore() {
  if (!store) {
    store = createStore();
  }

  return store;
}

function getClientKey(req) {
  const realIp = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim());
  if (realIp) return realIp;
  if (req.ip) return req.ip;
  return req.socket.remoteAddress || 'unknown';
}

function normalizeKeyPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9:_-]/g, '');
}

function createRateLimit({ windowMs, max, message, scope, identifier }) {
  return async (req, res, next) => {
    try {
      const keyParts = [
        scope || req.baseUrl || req.path || 'global',
        req.method || 'GET',
        getClientKey(req),
      ];

      if (typeof identifier === 'function') {
        const extraKey = normalizeKeyPart(identifier(req));
        if (extraKey) {
          keyParts.push(extraKey);
        }
      }

      const key = keyParts.join(':');
      const entry = await getStore().increment(key, windowMs);
      const remaining = Math.max(max - entry.count, 0);
      const retryAfterSeconds = Math.max(Math.ceil((entry.resetAt - Date.now()) / 1000), 0);

      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(remaining));
      res.set('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());

      if (entry.count > max) {
        res.set('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
          error: message || 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds,
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

const loginLimiter = createRateLimit({
  scope: 'auth:login',
  windowMs: 15 * 60 * 1000,
  max: 7,
  message: 'عفوا، لقد تجاوزت الحد المسموح به لمحاولات الدخول. يرجى المحاولة بعد 15 دقيقة.',
  identifier: (req) => req.body?.phone,
});

async function resetRateLimitStore() {
  if (store?.reset) {
    await store.reset();
  }
}

module.exports = { createRateLimit, loginLimiter, resetRateLimitStore };
