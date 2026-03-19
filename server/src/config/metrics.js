function parseBoolean(value, defaultValue) {
  if (value == null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getMetricsConfig() {
  return {
    enabled: parseBoolean(process.env.METRICS_ENABLED, true),
    token: process.env.METRICS_TOKEN || '',
    prefix: process.env.METRICS_PREFIX || 'etk_',
    collectDefaultMetrics: parseBoolean(process.env.METRICS_COLLECT_DEFAULTS, true),
  };
}

module.exports = {
  getMetricsConfig,
};
