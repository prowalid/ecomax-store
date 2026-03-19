const { randomUUID } = require('crypto');

const REQUEST_ID_HEADER = 'x-request-id';

function getRequestId(req) {
  const incoming = req.get(REQUEST_ID_HEADER);
  if (incoming && typeof incoming === 'string' && incoming.trim()) {
    return incoming.trim().slice(0, 128);
  }

  return randomUUID();
}

function requestContext(req, res, next) {
  const requestId = getRequestId(req);
  const logger = req.app?.locals?.container?.resolve?.('logger');
  req.id = requestId;
  req.requestId = requestId;
  req.logger = logger?.withRequestContext
    ? logger.withRequestContext(logger, requestId, { context: 'http' })
    : logger;
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}

module.exports = {
  REQUEST_ID_HEADER,
  requestContext,
};
