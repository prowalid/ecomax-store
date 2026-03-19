class CircuitBreaker {
  constructor({
    name,
    logger = null,
    failureThreshold = 3,
    resetTimeoutMs = 30_000,
  }) {
    this.name = name || 'external-service';
    this.logger = logger;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureAt = 0;
  }

  isOpen() {
    return this.state === 'open';
  }

  canProbe() {
    return this.isOpen() && Date.now() - this.lastFailureAt >= this.resetTimeoutMs;
  }

  async execute(work, meta = {}) {
    if (this.isOpen()) {
      if (!this.canProbe()) {
        const error = new Error(`${this.name} is temporarily unavailable`);
        error.code = 'CIRCUIT_OPEN';
        error.meta = { service: this.name, ...meta };
        throw error;
      }

      this.state = 'half-open';
    }

    try {
      const result = await work();
      this.failures = 0;
      this.state = 'closed';
      return result;
    } catch (error) {
      this.failures += 1;
      this.lastFailureAt = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
        this.logger?.warn?.('[CircuitBreaker] Opened circuit', {
          service: this.name,
          failures: this.failures,
          ...meta,
        });
      }

      throw error;
    }
  }

  getStatus() {
    return {
      service: this.name,
      state: this.state,
      failures: this.failures,
      lastFailureAt: this.lastFailureAt || null,
      resetTimeoutMs: this.resetTimeoutMs,
      failureThreshold: this.failureThreshold,
    };
  }
}

module.exports = {
  CircuitBreaker,
};
