import { beforeEach, describe, expect, it, vi } from "vitest";
import bullmqQueueManagerModule from "../../../server/src/infrastructure/queue/BullMQQueueManager";

const { BullMQQueueManager } = bullmqQueueManagerModule as any;

describe("BullMQQueueManager", () => {
  let queueAdd: any;
  let queueClose: any;
  let workerOn: any;
  let workerClose: any;
  let QueueClass: any;
  let WorkerClass: any;

  beforeEach(() => {
    queueAdd = vi.fn().mockResolvedValue(undefined);
    queueClose = vi.fn().mockResolvedValue(undefined);
    workerOn = vi.fn();
    workerClose = vi.fn().mockResolvedValue(undefined);

    QueueClass = vi.fn().mockImplementation(() => ({
      add: queueAdd,
      close: queueClose,
    }));

    WorkerClass = vi.fn().mockImplementation((_name, processor) => ({
      processor,
      on: workerOn,
      close: workerClose,
    }));
  });

  it("registers handlers and enqueues events", async () => {
    const queue = new BullMQQueueManager({
      config: {
        queueName: "etk-events",
        workerConcurrency: 2,
        redis: {
          host: "127.0.0.1",
          port: 6379,
          password: "",
          db: 0,
          keyPrefix: "test:",
        },
      },
      logger: {
        error: vi.fn(),
        info: vi.fn(),
      },
      QueueClass,
      WorkerClass,
    });

    queue.registerEventHandler("order.created", vi.fn());
    expect(queue.hasEventHandlers("order.created")).toBe(true);

    await queue.enqueueEvent("order.created", { eventId: "evt_1", orderId: "o1" });

    expect(QueueClass).toHaveBeenCalled();
    expect(WorkerClass).toHaveBeenCalled();
    expect(queueAdd).toHaveBeenCalledWith(
      "order.created",
      { eventId: "evt_1", orderId: "o1" },
      { jobId: "order.created:evt_1" }
    );
  });
});
