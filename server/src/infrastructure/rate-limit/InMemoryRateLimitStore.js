class InMemoryRateLimitStore {
  constructor() {
    this.buckets = new Map();

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();

      for (const [key, entry] of this.buckets.entries()) {
        if (now >= entry.resetAt) {
          this.buckets.delete(key);
        }
      }
    }, 60 * 1000);

    this.cleanupTimer.unref();
  }

  async increment(key, windowMs) {
    const now = Date.now();
    const current = this.buckets.get(key);

    if (!current || now >= current.resetAt) {
      const nextEntry = {
        count: 1,
        resetAt: now + windowMs,
      };

      this.buckets.set(key, nextEntry);
      return { count: nextEntry.count, resetAt: nextEntry.resetAt };
    }

    current.count += 1;
    this.buckets.set(key, current);

    return { count: current.count, resetAt: current.resetAt };
  }

  async reset() {
    this.buckets.clear();
  }

  async disconnect() {
    clearInterval(this.cleanupTimer);
  }
}

module.exports = {
  InMemoryRateLimitStore,
};
