function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getQueueConfig() {
  const driver = String(process.env.QUEUE_DRIVER || '').trim().toLowerCase() || 'inline';

  return {
    driver,
    queueName: process.env.QUEUE_NAME || 'etk-events',
    workerConcurrency: parseInteger(process.env.QUEUE_CONCURRENCY, 5),
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
  getQueueConfig,
};
