import { describe, expect, it, vi } from "vitest";
import deadLetterQueueServiceModule from "../../../server/src/infrastructure/services/DeadLetterQueueService";

const { DeadLetterQueueService } = deadLetterQueueServiceModule as any;

describe("DeadLetterQueueService", () => {
  it("persists failed queue jobs to dead_letter_queue", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new DeadLetterQueueService({
      pool: { query },
      logger: { warn: vi.fn() },
    });

    await service.record({
      driver: "bullmq",
      eventName: "order.created",
      jobId: "job-1",
      payload: { orderId: "o1" },
      error: "network down",
      attemptsMade: 3,
      maxAttempts: 3,
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([
      "bullmq",
      "order.created",
      "job-1",
      { orderId: "o1" },
      "network down",
      3,
      3,
    ]);
  });

  it("does not throw from recordBestEffort when persistence fails", async () => {
    const warn = vi.fn();
    const service = new DeadLetterQueueService({
      pool: { query: vi.fn().mockRejectedValue(new Error("db unavailable")) },
      logger: { warn },
    });

    await expect(
      service.recordBestEffort({
        driver: "inline",
        eventName: "order.updated",
        payload: {},
        error: "failed",
      })
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
  });
});
