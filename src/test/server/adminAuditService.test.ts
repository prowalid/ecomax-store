import { describe, expect, it, vi } from "vitest";
import adminAuditServiceModule from "../../../server/src/application/services/AdminAuditService";

const { AdminAuditService } = adminAuditServiceModule as any;

describe("AdminAuditService", () => {
  it("persists audit entries through the repository", async () => {
    const create = vi.fn().mockResolvedValue({ id: "a1" });
    const service = new AdminAuditService({
      adminAuditLogRepository: { create },
      logger: { warn: vi.fn() },
    });

    const result = await service.record({
      action: "product.update",
      entityType: "product",
      entityId: "p1",
    });

    expect(create).toHaveBeenCalledWith({
      action: "product.update",
      entityType: "product",
      entityId: "p1",
    });
    expect(result).toEqual({ id: "a1" });
  });

  it("does not throw when best-effort persistence fails", async () => {
    const warn = vi.fn();
    const service = new AdminAuditService({
      adminAuditLogRepository: {
        create: vi.fn().mockRejectedValue(new Error("db unavailable")),
      },
      logger: { warn },
    });

    const result = await service.recordBestEffort({
      action: "product.delete",
      entityType: "product",
      entityId: "p1",
    });

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});
