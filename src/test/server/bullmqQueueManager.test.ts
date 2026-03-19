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

  it("logs failed jobs with retry metadata", async () => {
    const errorLogger = vi.fn();
    const recordBestEffort = vi.fn();
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
        error: errorLogger,
        info: vi.fn(),
      },
      deadLetterQueueService: {
        recordBestEffort,
      },
      QueueClass,
      WorkerClass,
    });

    await queue.start();

    const failedCall = workerOn.mock.calls.find(([eventName]: any[]) => eventName === "failed");
    expect(failedCall).toBeTruthy();

    const failedHandler = failedCall?.[1];
    failedHandler(
      {
        id: "job-1",
        name: "order.created",
        attemptsMade: 3,
        opts: { attempts: 3 },
        data: { orderId: "o1" },
      },
      new Error("network down")
    );

    expect(errorLogger).toHaveBeenCalledWith("[Queue:bullmq] Event job failed", {
      queueName: "etk-events",
      jobId: "job-1",
      eventName: "order.created",
      attemptsMade: 3,
      maxAttempts: 3,
      payload: { orderId: "o1" },
      error: "network down",
    });
    expect(recordBestEffort).toHaveBeenCalledWith({
      driver: "bullmq",
      eventName: "order.created",
      jobId: "job-1",
      payload: { orderId: "o1" },
      error: "network down",
      attemptsMade: 3,
      maxAttempts: 3,
    });
  });
});
