function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveRateLimitStoreDriver() {
  const driver = (process.env.RATE_LIMIT_STORE || 'auto').toLowerCase();

  if (driver === 'redis' || driver === 'memory') {
    return driver;
  }

  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    return 'redis';
  }

  return 'memory';
}

module.exports = {
  driver: resolveRateLimitStoreDriver(),
  redis: {
    url: process.env.REDIS_URL || null,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInteger(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInteger(process.env.REDIS_DB, 0),
    keyPrefix: process.env.RATE_LIMIT_KEY_PREFIX
      || process.env.REDIS_KEY_PREFIX
      || 'rate-limit:',
  },
};
