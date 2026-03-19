import { describe, expect, it, vi } from "vitest";
import inlineQueueManagerModule from "../../../server/src/infrastructure/queue/InlineQueueManager";

const { InlineQueueManager } = inlineQueueManagerModule as any;

describe("InlineQueueManager dead letter behavior", () => {
  it("records failed inline handlers to the dead letter queue service", async () => {
    const recordBestEffort = vi.fn().mockResolvedValue(undefined);
    const queue = new InlineQueueManager({
      logger: { error: vi.fn() },
      deadLetterQueueService: { recordBestEffort },
    });

    queue.registerEventHandler("order.created", async () => {
      throw new Error("boom");
    });

    await queue.enqueueEvent("order.created", { orderId: "o1" });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(recordBestEffort).toHaveBeenCalledWith({
      driver: "inline",
      eventName: "order.created",
      payload: { orderId: "o1" },
      error: "boom",
      attemptsMade: 1,
      maxAttempts: 1,
    });
  });
});
