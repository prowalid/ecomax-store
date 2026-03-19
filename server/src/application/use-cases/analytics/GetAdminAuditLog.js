class GetAdminAuditLogUseCase {
  constructor({ analyticsRepository }) {
    this.analyticsRepository = analyticsRepository;
  }

  async execute({ limit = 15 } = {}) {
    const rows = await this.analyticsRepository.getRecentAdminAuditLog(limit);

    return rows.map((row) => ({
      id: row.id,
      actorUserId: row.actor_user_id || null,
      actorPhone: row.actor_phone || null,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id || null,
      requestId: row.request_id || null,
      ipAddress: row.ip_address || null,
      meta: row.meta || {},
      createdAt: row.created_at,
    }));
  }
}

module.exports = {
  GetAdminAuditLogUseCase,
};
