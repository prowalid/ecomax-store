class InlineQueueManager {
  constructor({ logger } = {}) {
    this.logger = logger;
    this.handlers = new Map();
  }

  registerEventHandler(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName).push(handler);
  }

  hasEventHandlers(eventName) {
    return (this.handlers.get(eventName) || []).length > 0;
  }

  async start() {}

  async enqueueEvent(eventName, payload) {
    const handlers = this.handlers.get(eventName) || [];
    if (handlers.length === 0) {
      return;
    }

    setImmediate(() => {
      Promise.allSettled(
        handlers.map((handler) => Promise.resolve().then(() => handler(payload)))
      ).then((results) => {
        results.forEach((result) => {
          if (result.status === 'rejected' && this.logger?.error) {
            this.logger.error('[Queue:inline] Event handler failed', {
              eventName,
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            });
          }
        });
      });
    });
  }

  async shutdown() {}

  async getHealthStatus() {
    return {
      status: 'ok',
      driver: 'inline',
      registeredEvents: this.handlers.size,
    };
  }
}

module.exports = {
  InlineQueueManager,
};
