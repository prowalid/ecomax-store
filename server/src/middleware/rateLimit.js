const buckets = new Map();

// Auto-cleanup interval: purge expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) {
      buckets.delete(key);
    }
  }
}, 60 * 1000).unref(); // .unref() so the timer doesn't prevent Node from exiting

function getClientKey(req) {
  const realIp = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim());
  if (realIp) return realIp;
  if (req.ip) return req.ip;
  return req.socket.remoteAddress || 'unknown';
}

function createRateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.path}:${getClientKey(req)}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({ error: message || 'Too many requests' });
    }

    entry.count += 1;
    buckets.set(key, entry);
    next();
  };
}

module.exports = { createRateLimit };
