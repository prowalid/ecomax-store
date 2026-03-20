const { createHash } = require('crypto');

const IDEMPOTENCY_HEADER = 'idempotency-key';

function buildFingerprint(req) {
  const body = req.body && typeof req.body === 'object'
    ? JSON.stringify(req.body)
    : String(req.body || '');

  return createHash('sha256')
    .update(`${req.method}:${req.originalUrl || req.url}:${body}`)
    .digest('hex');
}

function createIdempotencyMiddleware({
  cacheService,
  ttlMs = 24 * 60 * 60 * 1000,
  lockTtlMs = 60 * 1000,
} = {}) {
  return async function idempotencyMiddleware(req, res, next) {
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    const keyHeader = req.headers[IDEMPOTENCY_HEADER];
    const key = typeof keyHeader === 'string' ? keyHeader.trim() : '';

    if (!key || !cacheService) {
      return next();
    }

    const cacheKey = `idempotency:${key}`;
    const fingerprint = buildFingerprint(req);

    const handleReplay = (cached) => {
      if (cached.fingerprint !== fingerprint) {
        return res.status(409).json({
          error: 'Idempotency key reuse conflict',
          code: 'IDEMPOTENCY_KEY_CONFLICT',
        });
      }

      if (cached.state === 'completed') {
        res.set('X-Idempotent-Replayed', 'true');
        return res.status(cached.status).json(cached.body);
      }

      return res.status(409).json({
        error: 'A request with the same idempotency key is already in progress.',
        code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS',
      });
    };

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return handleReplay(cached);
    }

    const lockPayload = {
      state: 'in_progress',
      fingerprint,
      createdAt: new Date().toISOString(),
    };

    const lockAcquired = await cacheService.setIfAbsent(cacheKey, lockPayload, lockTtlMs);
    if (!lockAcquired) {
      const existing = await cacheService.get(cacheKey);
      if (existing) {
        return handleReplay(existing);
      }
    }

    let finalized = false;
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (!finalized) {
        finalized = true;
        try {
          if (res.statusCode < 500) {
            await cacheService.set(cacheKey, {
              state: 'completed',
              fingerprint,
              status: res.statusCode || 200,
              body,
            }, ttlMs);
          } else {
            await cacheService.delete(cacheKey);
          }
        } catch (err) {
          console.error('[Idempotency] Failed to finalize cache state:', err);
        }
      }

      return originalJson(body);
    };

    const cleanup = async () => {
      if (!finalized) {
        finalized = true;
        try {
          await cacheService.delete(cacheKey);
        } catch (err) {
          console.error('[Idempotency] Failed to cleanup cache lock:', err);
        }
      }
    };

    res.on('close', cleanup);
    res.on('finish', async () => {
      if (!finalized && res.statusCode >= 500) {
        await cleanup();
      }
    });

    return next();
  };
}

module.exports = {
  IDEMPOTENCY_HEADER,
  createIdempotencyMiddleware,
};
