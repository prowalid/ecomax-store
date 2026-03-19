class InMemoryCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async setIfAbsent(key, value, ttlMs) {
    const entry = this.store.get(key);
    if (entry && Date.now() <= entry.expiresAt) {
      return false;
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return true;
  }

  async delete(key) {
    this.store.delete(key);
  }

  async deleteByPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  async ping() {
    return 'PONG';
  }
}

module.exports = {
  InMemoryCache,
};
