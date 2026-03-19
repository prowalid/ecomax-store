async function getAnalytics(req, res, next) {
  try {
    const getAnalyticsUseCase = req.app.locals.container?.resolve('getAnalyticsUseCase');
    const analytics = await getAnalyticsUseCase.execute();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

async function getAdminAuditLog(req, res, next) {
  try {
    const getAdminAuditLogUseCase = req.app.locals.container?.resolve('getAdminAuditLogUseCase');
    const limit = Number.parseInt(req.query.limit, 10);
    const auditLog = await getAdminAuditLogUseCase.execute({
      limit: Number.isFinite(limit) ? limit : 15,
    });
    res.json(auditLog);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnalytics,
  getAdminAuditLog,
};
