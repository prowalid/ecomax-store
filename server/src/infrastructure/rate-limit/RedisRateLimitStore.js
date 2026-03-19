const Redis = require('ioredis');

class RedisRateLimitStore {
  constructor(config) {
    const connection = config.url
      ? config.url
      : {
          host: config.host,
          port: config.port,
          password: config.password,
          db: config.db,
        };

    this.keyPrefix = config.keyPrefix || 'rate-limit:';
    this.client = new Redis(connection, {
      lazyConnect: false,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: true,
    });
  }

  buildKey(key) {
    return `${this.keyPrefix}${key}`;
  }

  async increment(key, windowMs) {
    const redisKey = this.buildKey(key);
    const count = await this.client.incr(redisKey);

    if (count === 1) {
      await this.client.pexpire(redisKey, windowMs);
    }

    let ttlMs = await this.client.pttl(redisKey);

    if (ttlMs < 0) {
      ttlMs = windowMs;
      await this.client.pexpire(redisKey, windowMs);
    }

    return {
      count,
      resetAt: Date.now() + ttlMs,
    };
  }

  async reset() {
    const stream = this.client.scanStream({
      match: `${this.keyPrefix}*`,
      count: 100,
    });

    await new Promise((resolve, reject) => {
      stream.on('data', (keys) => {
        if (keys.length > 0) {
          this.client.del(...keys).catch(reject);
        }
      });
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  async disconnect() {
    await this.client.quit();
  }
}

module.exports = {
  RedisRateLimitStore,
};
