async function getHealth(req, res, next) {
  try {
    const useCase = req.app.locals.container?.resolve('getHealthStatusUseCase');
    if (!useCase) {
      throw new Error('GetHealthStatusUseCase is not available');
    }

    const payload = await useCase.execute({ requestId: req.id });
    res.status(payload.status === 'ok' ? 200 : 503).json(payload);
  } catch (err) {
    next(err);
  }
}

function getLive(_req, res) {
  res.json({
    status: 'ok',
    requestId: _req.id,
    uptimeSeconds: Math.round(process.uptime()),
  });
}

async function getReady(req, res, next) {
  try {
    const useCase = req.app.locals.container?.resolve('getHealthStatusUseCase');
    if (!useCase) {
      throw new Error('GetHealthStatusUseCase is not available');
    }

    const payload = await useCase.execute({ requestId: req.id });
    res.status(payload.status === 'ok' ? 200 : 503).json({
      status: payload.status,
      requestId: payload.requestId,
      checks: payload.checks,
    });
  } catch (err) {
    next(err);
  }
}

function getVersion(_req, res) {
  const getVersionPayload = _req.app.locals.container?.resolve('getVersionPayload');
  if (!getVersionPayload) {
    throw new Error('getVersionPayload is not available');
  }

  res.json(getVersionPayload());
}

async function getMetrics(req, res, next) {
  try {
    const container = req.app.locals.container;
    const metricsConfig = container?.resolve('metricsConfig');
    const metricsService = container?.resolve('metricsService');

    if (!metricsConfig?.enabled) {
      res.status(404).json({ error: 'Metrics are disabled' });
      return;
    }

    if (metricsConfig.token) {
      const authHeader = req.headers.authorization || '';
      if (authHeader !== `Bearer ${metricsConfig.token}`) {
        res.status(401).json({ error: 'Unauthorized metrics access' });
        return;
      }
    }

    res.set('Content-Type', metricsService.getContentType());
    res.send(await metricsService.getMetrics());
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealth,
  getLive,
  getReady,
  getVersion,
  getMetrics,
};
