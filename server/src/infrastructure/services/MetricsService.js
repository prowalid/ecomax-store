const client = require('prom-client');

function normalizeRoute(baseUrl, routePath, fallbackPath) {
  const normalizedRoutePath = typeof routePath === 'string'
    ? routePath
    : '';
  const combined = `${baseUrl || ''}${normalizedRoutePath}` || fallbackPath || 'unmatched';
  return combined || 'unmatched';
}

class MetricsService {
  constructor({
    prefix = 'etk_',
    collectDefaultMetrics = true,
    promClient = client,
  } = {}) {
    this.promClient = promClient;
    this.registry = new promClient.Registry();

    if (collectDefaultMetrics) {
      promClient.collectDefaultMetrics({
        register: this.registry,
        prefix,
      });
    }

    this.httpRequestsTotal = new promClient.Counter({
      name: `${prefix}http_requests_total`,
      help: 'Total number of handled HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new promClient.Histogram({
      name: `${prefix}http_request_duration_seconds`,
      help: 'Duration of handled HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new promClient.Gauge({
      name: `${prefix}http_requests_in_flight`,
      help: 'Current number of in-flight HTTP requests',
      registers: [this.registry],
    });

    this.domainEventsTotal = new promClient.Counter({
      name: `${prefix}domain_events_total`,
      help: 'Domain events published and queued',
      labelNames: ['event_name', 'phase'],
      registers: [this.registry],
    });
  }

  onRequestStart() {
    this.httpRequestsInFlight.inc();
  }

  onRequestComplete({ method, baseUrl, routePath, fallbackPath, statusCode, durationSeconds }) {
    const labels = {
      method: method || 'UNKNOWN',
      route: normalizeRoute(baseUrl, routePath, fallbackPath),
      status_code: String(statusCode || 0),
    };

    this.httpRequestsInFlight.dec();
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationSeconds);
  }

  onDomainEvent(eventName, phase) {
    this.domainEventsTotal.inc({
      event_name: eventName,
      phase,
    });
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  getContentType() {
    return this.registry.contentType;
  }
}

module.exports = {
  MetricsService,
};
