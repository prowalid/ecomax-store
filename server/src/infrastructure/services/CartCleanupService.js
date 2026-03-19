const CART_RETENTION_DAYS = 7;
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

class CartCleanupService {
  constructor({ pool, logger = console, retentionDays = CART_RETENTION_DAYS, intervalMs = CLEANUP_INTERVAL_MS }) {
    this.pool = pool;
    this.logger = logger;
    this.retentionDays = retentionDays;
    this.intervalMs = intervalMs;
  }

  async cleanupExpiredCartItems() {
    const { rowCount } = await this.pool.query(
      `DELETE FROM cart_items
       WHERE created_at < NOW() - ($1::text || ' days')::interval`,
      [String(this.retentionDays)]
    );

    if (rowCount > 0) {
      this.logger.info?.(`[Cart Cleanup] Removed ${rowCount} expired cart item(s).`);
    }

    return rowCount;
  }

  startCleanupJob() {
    this.cleanupExpiredCartItems().catch((error) => {
      this.logger.error?.('[Cart Cleanup Error]', error);
    });

    setInterval(() => {
      this.cleanupExpiredCartItems().catch((error) => {
        this.logger.error?.('[Cart Cleanup Error]', error);
      });
    }, this.intervalMs).unref();
  }
}

module.exports = {
  CartCleanupService,
  CART_RETENTION_DAYS,
  CLEANUP_INTERVAL_MS,
};
