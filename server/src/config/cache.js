function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCacheConfig() {
  const driver = String(process.env.CACHE_DRIVER || '').trim().toLowerCase();

  return {
    driver: driver || 'memory',
    redis: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInteger(process.env.REDIS_PORT, 6379),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInteger(process.env.REDIS_DB, 0),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'etk:',
    },
  };
}

module.exports = {
  getCacheConfig,
};
