const { IAnalyticsRepository } = require('../../domain/repositories/IAnalyticsRepository');

class PgAnalyticsRepository extends IAnalyticsRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async getMetrics(timezone) {
    const result = await this.pool.query(
      `
        SELECT
          COUNT(*)::int AS total_orders,
          COUNT(*) FILTER (WHERE status = 'new')::int AS new_orders,
          COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders,
          COUNT(*) FILTER (WHERE status IN ('confirmed', 'ready', 'shipped', 'delivered'))::int AS confirmed_pipeline_orders,
          COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_orders,
          COALESCE(SUM(total) FILTER (WHERE status = 'delivered'), 0) AS total_revenue,
          COALESCE(
            SUM(total) FILTER (
              WHERE status = 'delivered'
                AND created_at >= NOW() - INTERVAL '30 days'
            ),
            0
          ) AS month_revenue,
          COALESCE(AVG(total) FILTER (WHERE status = 'delivered'), 0) AS avg_delivered_order_value,
          COUNT(*) FILTER (
            WHERE (created_at AT TIME ZONE $1) >= date_trunc('day', NOW() AT TIME ZONE $1)
          )::int AS today_orders,
          COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '7 days'
          )::int AS week_orders,
          COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '30 days'
          )::int AS month_orders
        FROM orders
      `,
      [timezone]
    );

    return result.rows[0] || {};
  }

  async getProductMetrics() {
    const result = await this.pool.query(
      `
        SELECT
          COUNT(*) FILTER (WHERE status = 'active')::int AS active_products,
          COUNT(*) FILTER (WHERE status = 'active' AND stock > 0 AND stock < 10)::int AS low_stock_products,
          COUNT(*) FILTER (WHERE status = 'active' AND stock = 0)::int AS out_of_stock_products
        FROM products
      `
    );

    return result.rows[0] || {};
  }

  async getCustomerMetrics() {
    const result = await this.pool.query(
      `
        SELECT
          COUNT(*)::int AS total_customers,
          COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '30 days'
          )::int AS new_customers_30d
        FROM customers
      `
    );

    return result.rows[0] || {};
  }

  async getStatusBreakdown() {
    const result = await this.pool.query(
      `
        SELECT status, COUNT(*)::int AS count
        FROM orders
        GROUP BY status
      `
    );

    return result.rows;
  }

  async getRecentAdminAuditLog(limit = 20) {
    const normalizedLimit = Number.isFinite(Number(limit))
      ? Math.max(1, Math.min(50, Number(limit)))
      : 20;

    const result = await this.pool.query(
      `
        SELECT
          id,
          actor_user_id,
          actor_phone,
          action,
          entity_type,
          entity_id,
          request_id,
          ip_address,
          meta,
          created_at
        FROM admin_audit_log
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [normalizedLimit]
    );

    return result.rows;
  }
}

module.exports = {
  PgAnalyticsRepository,
};
