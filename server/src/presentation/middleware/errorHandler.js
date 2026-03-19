exports.errorHandler = (err, req, res, _next) => {
  const logger = req.app?.locals?.container?.resolve?.('logger');
  const requestId = req.id || req.requestId || res.locals?.requestId;
  const contextLogger = logger?.withRequestContext
    ? logger.withRequestContext(logger, requestId)
    : logger;

  if (contextLogger?.error) {
    contextLogger.error('Unhandled request error', {
      method: req.method,
      path: req.originalUrl,
      status: err.status,
      code: err.code,
      errorMessage: err.message,
    });
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A resource with that unique constraint already exists.',
      requestId,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Referenced resource does not exist (Foreign Key Constraint).',
      requestId,
    });
  }

  if (err.statusCode && Number.isInteger(err.statusCode)) {
    return res.status(err.statusCode).json({
      error: err.statusCode >= 500 ? 'Internal Server Error' : 'Bad Request',
      message: err.statusCode >= 500 && isProduction
        ? 'حدث خطأ داخلي غير متوقع. يرجى المحاولة لاحقًا.'
        : (err.message || 'Request failed'),
      ...(err.code ? { code: err.code } : {}),
      ...(err.details !== undefined ? { details: err.details } : {}),
      ...(err.requires_2fa ? { requires_2fa: true } : {}),
      requestId,
    });
  }

  if (err.status && Number.isInteger(err.status)) {
    return res.status(err.status).json({
      error: err.status >= 500 ? 'Internal Server Error' : 'Bad Request',
      message: err.status >= 500 && isProduction
        ? 'حدث خطأ داخلي غير متوقع. يرجى المحاولة لاحقًا.'
        : (err.message || 'Request failed'),
      ...(err.code ? { code: err.code } : {}),
      ...(err.details !== undefined ? { details: err.details } : {}),
      ...(err.requires_2fa ? { requires_2fa: true } : {}),
      requestId,
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction
      ? 'حدث خطأ داخلي غير متوقع. يرجى المحاولة لاحقًا.'
      : err.message,
    requestId,
  });
};
