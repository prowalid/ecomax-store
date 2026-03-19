function getRequestIp(req) {
  return req.headers['cf-connecting-ip']
    || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim())
    || req.ip
    || null;
}

async function recordAdminAudit(req, {
  action,
  entityType,
  entityId = null,
  meta = {},
}) {
  if (!req.user) {
    return;
  }

  const auditService = req.app.locals.container?.resolve?.('adminAuditService');
  if (!auditService?.recordBestEffort) {
    return;
  }

  await auditService.recordBestEffort({
    actorUserId: req.user.id || null,
    actorPhone: req.user.phone || null,
    action,
    entityType,
    entityId,
    requestId: req.id || req.requestId || null,
    ipAddress: getRequestIp(req),
    meta,
  });
}

module.exports = {
  recordAdminAudit,
  getRequestIp,
};
