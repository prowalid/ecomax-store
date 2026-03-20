class InMemoryCache {
  constructor(maxSize = 5000) {
    this.store = new Map();
    this.maxSize = maxSize;
    this.sweepInterval = setInterval(() => this._sweep(), 5 * 60 * 1000);
    this.sweepInterval.unref();
  }

  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
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
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      // Evict oldest entry (Map iterates in insertion order)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
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

    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
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
