class EventBus {
  constructor({ queueManager, metricsService } = {}) {
    this.handlers = new Map();
    this.queueManager = queueManager || null;
    this.metricsService = metricsService || null;
  }

  subscribe(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName).push(handler);
  }

  subscribeQueued(eventName, handler) {
    if (!this.queueManager) {
      return this.subscribe(eventName, handler);
    }

    this.queueManager.registerEventHandler(eventName, handler);
  }

  async publish(eventName, payload) {
    const resolvedEventName = typeof eventName === 'object' && eventName
      ? eventName.name
      : eventName;
    const resolvedPayload = typeof eventName === 'object' && eventName
      ? eventName.payload
      : payload;

    this.metricsService?.onDomainEvent?.(resolvedEventName, 'published');

    const directHandlers = this.handlers.get(resolvedEventName) || [];
    await Promise.allSettled(
      directHandlers.map((handler) => Promise.resolve().then(() => handler(resolvedPayload)))
    );

    if (this.queueManager?.hasEventHandlers(resolvedEventName)) {
      this.metricsService?.onDomainEvent?.(resolvedEventName, 'queued');
      await this.queueManager.enqueueEvent(resolvedEventName, resolvedPayload);
    }
  }
}

module.exports = {
  EventBus,
};
