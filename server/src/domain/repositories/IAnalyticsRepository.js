const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IAnalyticsRepository extends BaseRepositoryContract {
  async getMetrics() { this.notImplemented('getMetrics'); }
  async getProductMetrics() { this.notImplemented('getProductMetrics'); }
  async getCustomerMetrics() { this.notImplemented('getCustomerMetrics'); }
  async getStatusBreakdown() { this.notImplemented('getStatusBreakdown'); }
}

module.exports = { IAnalyticsRepository };
