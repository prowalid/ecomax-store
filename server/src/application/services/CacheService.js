class CacheService {
  constructor(cacheStore) {
    this.cacheStore = cacheStore;
  }

  async get(key) {
    return this.cacheStore.get(key);
  }

  async set(key, value, ttlMs) {
    return this.cacheStore.set(key, value, ttlMs);
  }

  async setIfAbsent(key, value, ttlMs) {
    if (typeof this.cacheStore.setIfAbsent === 'function') {
      return this.cacheStore.setIfAbsent(key, value, ttlMs);
    }

    const existing = await this.cacheStore.get(key);
    if (existing !== null) {
      return false;
    }

    await this.cacheStore.set(key, value, ttlMs);
    return true;
  }

  async getOrSet(key, ttlMs, loader) {
    const cached = await this.cacheStore.get(key);
    if (cached !== null) {
      return cached;
    }

    const freshValue = await loader();
    await this.cacheStore.set(key, freshValue, ttlMs);
    return freshValue;
  }

  invalidate(key) {
    return this.cacheStore.delete(key);
  }

  delete(key) {
    return this.cacheStore.delete(key);
  }

  invalidateByPrefix(prefix) {
    return this.cacheStore.deleteByPrefix(prefix);
  }
}

module.exports = {
  CacheService,
};
