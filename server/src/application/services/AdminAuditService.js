class AdminAuditService {
  constructor({ adminAuditLogRepository, logger }) {
    this.adminAuditLogRepository = adminAuditLogRepository;
    this.logger = logger;
  }

  async record(entry) {
    return this.adminAuditLogRepository.create(entry);
  }

  async recordBestEffort(entry) {
    try {
      return await this.record(entry);
    } catch (error) {
      this.logger?.warn?.('[Audit] Failed to persist admin audit log', {
        action: entry?.action || null,
        entityType: entry?.entityType || null,
        entityId: entry?.entityId || null,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

module.exports = {
  AdminAuditService,
};
