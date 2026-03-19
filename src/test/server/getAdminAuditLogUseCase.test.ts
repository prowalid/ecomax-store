import { beforeEach, describe, expect, it } from "vitest";
import getAdminAuditLogUseCaseModule from "../../../server/src/application/use-cases/analytics/GetAdminAuditLog";

const { GetAdminAuditLogUseCase } = getAdminAuditLogUseCaseModule as any;

describe("GetAdminAuditLogUseCase", () => {
  let analyticsRepository: any;
  let useCase: any;

  beforeEach(() => {
    analyticsRepository = {
      getRecentAdminAuditLog: async () => [
        {
          id: "a1",
          actor_user_id: "u1",
          actor_phone: "0550000001",
          action: "product.update",
          entity_type: "product",
          entity_id: "p1",
          request_id: "req-1",
          ip_address: "127.0.0.1",
          meta: { name: "Produit 1" },
          created_at: "2026-03-19T14:00:00.000Z",
        },
      ],
    };

    useCase = new GetAdminAuditLogUseCase({ analyticsRepository });
  });

  it("normalizes recent admin audit log rows for the API", async () => {
    const result = await useCase.execute({ limit: 10 });

    expect(result).toEqual([
      {
        id: "a1",
        actorUserId: "u1",
        actorPhone: "0550000001",
        action: "product.update",
        entityType: "product",
        entityId: "p1",
        requestId: "req-1",
        ipAddress: "127.0.0.1",
        meta: { name: "Produit 1" },
        createdAt: "2026-03-19T14:00:00.000Z",
      },
    ]);
  });
});
