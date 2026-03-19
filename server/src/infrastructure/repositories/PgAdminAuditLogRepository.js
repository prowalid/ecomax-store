class PgAdminAuditLogRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(entry) {
    const payload = {
      actor_user_id: entry.actorUserId || null,
      actor_phone: entry.actorPhone || null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId || null,
      request_id: entry.requestId || null,
      ip_address: entry.ipAddress || null,
      meta: entry.meta || {},
    };

    const { rows } = await this.pool.query(
      `
        INSERT INTO admin_audit_log (
          actor_user_id,
          actor_phone,
          action,
          entity_type,
          entity_id,
          request_id,
          ip_address,
          meta
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        payload.actor_user_id,
        payload.actor_phone,
        payload.action,
        payload.entity_type,
        payload.entity_id,
        payload.request_id,
        payload.ip_address,
        payload.meta,
      ]
    );

    return rows[0];
  }
}

module.exports = {
  PgAdminAuditLogRepository,
};
