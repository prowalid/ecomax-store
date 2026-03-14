const pool = require('../config/db');

const CART_RETENTION_DAYS = 7;
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function cleanupExpiredCartItems() {
  const { rowCount } = await pool.query(
    `DELETE FROM cart_items
     WHERE created_at < NOW() - ($1::text || ' days')::interval`,
    [String(CART_RETENTION_DAYS)]
  );

  if (rowCount > 0) {
    console.log(`[Cart Cleanup] Removed ${rowCount} expired cart item(s).`);
  }
}

function startCartCleanupJob() {
  cleanupExpiredCartItems().catch((err) => {
    console.error('[Cart Cleanup Error]', err);
  });

  setInterval(() => {
    cleanupExpiredCartItems().catch((err) => {
      console.error('[Cart Cleanup Error]', err);
    });
  }, CLEANUP_INTERVAL_MS).unref();
}

module.exports = {
  cleanupExpiredCartItems,
  startCartCleanupJob,
};
