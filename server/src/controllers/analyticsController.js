const pool = require('../config/db');

const ALGIERS_TIMEZONE = 'Africa/Algiers';

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getAnalytics(req, res, next) {
  try {
    const metricsQuery = `
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
    `;

    const productsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')::int AS active_products,
        COUNT(*) FILTER (WHERE status = 'active' AND stock > 0 AND stock < 10)::int AS low_stock_products,
        COUNT(*) FILTER (WHERE status = 'active' AND stock = 0)::int AS out_of_stock_products
      FROM products
    `;

    const customersQuery = `
      SELECT
        COUNT(*)::int AS total_customers,
        COUNT(*) FILTER (
          WHERE created_at >= NOW() - INTERVAL '30 days'
        )::int AS new_customers_30d
      FROM customers
    `;

    const statusBreakdownQuery = `
      SELECT status, COUNT(*)::int AS count
      FROM orders
      GROUP BY status
    `;

    const [
      metricsResult,
      productsResult,
      customersResult,
      statusBreakdownResult,
    ] = await Promise.all([
      pool.query(metricsQuery, [ALGIERS_TIMEZONE]),
      pool.query(productsQuery),
      pool.query(customersQuery),
      pool.query(statusBreakdownQuery),
    ]);

    const metricsRow = metricsResult.rows[0] || {};
    const productsRow = productsResult.rows[0] || {};
    const customersRow = customersResult.rows[0] || {};

    const totalOrders = toNumber(metricsRow.total_orders);
    const deliveredOrders = toNumber(metricsRow.delivered_orders);
    const confirmedPipelineOrders = toNumber(metricsRow.confirmed_pipeline_orders);
    const cancelledOrders = toNumber(metricsRow.cancelled_orders);

    const statusBreakdown = {
      new: 0,
      attempt: 0,
      no_answer: 0,
      confirmed: 0,
      cancelled: 0,
      ready: 0,
      shipped: 0,
      delivered: 0,
      returned: 0,
    };

    for (const row of statusBreakdownResult.rows) {
      statusBreakdown[row.status] = toNumber(row.count);
    }

    res.json({
      timezone: ALGIERS_TIMEZONE,
      sales: {
        totalRevenue: toNumber(metricsRow.total_revenue),
        monthRevenue: toNumber(metricsRow.month_revenue),
        avgDeliveredOrderValue: toNumber(metricsRow.avg_delivered_order_value),
      },
      orders: {
        total: totalOrders,
        new: toNumber(metricsRow.new_orders),
        delivered: deliveredOrders,
        confirmedPipeline: confirmedPipelineOrders,
        cancelled: cancelledOrders,
        today: toNumber(metricsRow.today_orders),
        week: toNumber(metricsRow.week_orders),
        month: toNumber(metricsRow.month_orders),
        confirmRate: totalOrders > 0 ? Math.round((confirmedPipelineOrders / totalOrders) * 100) : 0,
        cancelRate: totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0,
        statusBreakdown,
      },
      products: {
        active: toNumber(productsRow.active_products),
        lowStock: toNumber(productsRow.low_stock_products),
        outOfStock: toNumber(productsRow.out_of_stock_products),
      },
      customers: {
        total: toNumber(customersRow.total_customers),
        newLast30Days: toNumber(customersRow.new_customers_30d),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
