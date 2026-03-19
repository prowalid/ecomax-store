class RedisCache {
  constructor(options) {
    let Redis;

    try {
      // Optional dependency by design: if Redis is enabled later and the package
      // is installed, this adapter becomes active without changing the API layer.
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      Redis = require('ioredis');
    } catch (error) {
      const missingDependencyError = new Error(
        'Redis cache requested but "ioredis" is not installed in server dependencies.'
      );
      missingDependencyError.cause = error;
      throw missingDependencyError;
    }

    this.client = new Redis({
      host: options.host,
      port: options.port,
      password: options.password || undefined,
      db: options.db,
      keyPrefix: options.keyPrefix,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async ensureConnected() {
    if (this.client.status === 'ready' || this.client.status === 'connect') {
      return;
    }

    await this.client.connect();
  }

  get(key) {
    return this.client.get(key).then((value) => {
      if (value == null) return null;
      return JSON.parse(value);
    });
  }

  set(key, value, ttlMs) {
    const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
    return this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async setIfAbsent(key, value, ttlMs) {
    await this.ensureConnected();
    const ttlMilliseconds = Math.max(1, Math.ceil(ttlMs));
    const result = await this.client.set(key, JSON.stringify(value), 'PX', ttlMilliseconds, 'NX');
    return result === 'OK';
  }

  delete(key) {
    return this.client.del(key);
  }

  async deleteByPrefix(prefix) {
    let cursor = '0';
    const keyPrefix = this.client.options.keyPrefix || '';
    const matchPattern = `${keyPrefix}${prefix}*`;

    do {
      const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', matchPattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        const normalizedKeys = keyPrefix
          ? keys.map((key) => key.startsWith(keyPrefix) ? key.slice(keyPrefix.length) : key)
          : keys;

        if (normalizedKeys.length > 0) {
          await this.client.del(...normalizedKeys);
        }
      }
    } while (cursor !== '0');
  }

  async ping() {
    await this.ensureConnected();
    return this.client.ping();
  }
}

module.exports = {
  RedisCache,
};
