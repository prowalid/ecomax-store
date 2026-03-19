import { describe, expect, it, vi } from "vitest";
import cartCleanupServiceModule from "../../../server/src/infrastructure/services/CartCleanupService";

const { CartCleanupService } = cartCleanupServiceModule as any;

describe("CartCleanupService", () => {
  it("deletes expired cart items using the configured retention days", async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rowCount: 3 }),
    };
    const logger = { info: vi.fn(), error: vi.fn() };

    const service = new CartCleanupService({
      pool,
      logger,
      retentionDays: 10,
    });

    const removedCount = await service.cleanupExpiredCartItems();

    expect(removedCount).toBe(3);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM cart_items"),
      ["10"]
    );
    expect(logger.info).toHaveBeenCalledWith("[Cart Cleanup] Removed 3 expired cart item(s).");
  });
});
