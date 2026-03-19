import { describe, expect, it, vi } from "vitest";
import eventBusModule from "../../../server/src/application/services/EventBus";

const { EventBus } = eventBusModule;

describe("EventBus", () => {
  it("publishes events to subscribed handlers", async () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe("order.created", handler);
    await bus.publish("order.created", { orderId: "123" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ orderId: "123" });
  });

  it("does not fail the publish call when one handler throws", async () => {
    const bus = new EventBus();
    const okHandler = vi.fn();

    bus.subscribe("order.created", () => {
      throw new Error("boom");
    });
    bus.subscribe("order.created", okHandler);

    await expect(bus.publish("order.created", { orderId: "456" })).resolves.toBeUndefined();
    expect(okHandler).toHaveBeenCalledWith({ orderId: "456" });
  });

  it("enqueues queued handlers without executing them inline", async () => {
    const queueManager = {
      registerEventHandler: vi.fn(),
      hasEventHandlers: vi.fn().mockReturnValue(true),
      enqueueEvent: vi.fn().mockResolvedValue(undefined),
    };
    const bus = new EventBus({ queueManager } as any);
    const inlineHandler = vi.fn();
    const queuedHandler = vi.fn();

    bus.subscribe("order.created", inlineHandler);
    bus.subscribeQueued("order.created", queuedHandler);

    await bus.publish("order.created", { orderId: "789" });

    expect(inlineHandler).toHaveBeenCalledWith({ orderId: "789" });
    expect(queueManager.registerEventHandler).toHaveBeenCalledWith("order.created", queuedHandler);
    expect(queueManager.enqueueEvent).toHaveBeenCalledWith("order.created", { orderId: "789" });
    expect(queuedHandler).not.toHaveBeenCalled();
  });
});
