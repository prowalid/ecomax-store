import { describe, expect, it, vi } from "vitest";
import inlineQueueManagerModule from "../../../server/src/infrastructure/queue/InlineQueueManager";

const { InlineQueueManager } = inlineQueueManagerModule as any;

describe("InlineQueueManager", () => {
  it("runs queued handlers asynchronously", async () => {
    const handler = vi.fn();
    const queue = new InlineQueueManager({
      logger: {
        error: vi.fn(),
      },
    });

    queue.registerEventHandler("order.created", handler);
    await queue.enqueueEvent("order.created", { orderId: "o1" });

    expect(handler).not.toHaveBeenCalled();

    await new Promise((resolve) => setImmediate(resolve));

    expect(handler).toHaveBeenCalledWith({ orderId: "o1" });
  });
});
