function createMetricsMiddleware({ metricsService }) {
  return function metricsMiddleware(req, res, next) {
    if (!metricsService || req.path === '/api/metrics') {
      next();
      return;
    }

    const startedAt = process.hrtime.bigint();
    metricsService.onRequestStart();

    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - startedAt;
      metricsService.onRequestComplete({
        method: req.method,
        baseUrl: req.baseUrl,
        routePath: req.route?.path,
        fallbackPath: req.path,
        statusCode: res.statusCode,
        durationSeconds: Number(durationNs) / 1e9,
      });
    });

    next();
  };
}

module.exports = {
  createMetricsMiddleware,
};
