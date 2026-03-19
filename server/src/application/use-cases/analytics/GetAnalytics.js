const ALGIERS_TIMEZONE = 'Africa/Algiers';

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

class GetAnalyticsUseCase {
  constructor({ analyticsRepository }) {
    this.analyticsRepository = analyticsRepository;
  }

  async execute() {
    const [
      metricsRow,
      productsRow,
      customersRow,
      statusBreakdownRows,
    ] = await Promise.all([
      this.analyticsRepository.getMetrics(ALGIERS_TIMEZONE),
      this.analyticsRepository.getProductMetrics(),
      this.analyticsRepository.getCustomerMetrics(),
      this.analyticsRepository.getStatusBreakdown(),
    ]);

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

    for (const row of statusBreakdownRows) {
      statusBreakdown[row.status] = toNumber(row.count);
    }

    return {
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
    };
  }
}

module.exports = {
  GetAnalyticsUseCase,
};

