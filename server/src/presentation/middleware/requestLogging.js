function getClientIp(req) {
  return req.headers['cf-connecting-ip']
    || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim())
    || req.ip
    || req.socket?.remoteAddress
    || null;
}

function requestLogging(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const logger = req.logger || req.app?.locals?.container?.resolve?.('logger');

  res.on('finish', () => {
    if (!logger?.info) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info('HTTP request completed', {
      context: 'http',
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(durationMs * 100) / 100,
      clientIp: getClientIp(req),
      userAgent: req.headers['user-agent'] || null,
      contentLength: res.getHeader ? res.getHeader('content-length') || null : null,
    });
  });

  next();
}

module.exports = {
  requestLogging,
};
