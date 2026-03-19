import { describe, expect, it, vi } from "vitest";
import orderCreatedWorkerModule from "../../../server/src/infrastructure/queue/workers/OrderCreatedWorker";

const { OrderCreatedWorker } = orderCreatedWorkerModule as any;

describe("OrderCreatedWorker", () => {
  it("sends webhook and notification payloads", async () => {
    const orderWebhookService = {
      buildOrderWebhookPayload: vi.fn().mockReturnValue({ ok: true }),
      sendOrderWebhook: vi.fn().mockResolvedValue(undefined),
      triggerOrderStatusNotification: vi.fn().mockResolvedValue(undefined),
    };

    const worker = new OrderCreatedWorker({
      orderWebhookService,
      logger: { info: vi.fn() },
    });

    await worker.process({
      order: {
        id: "o1",
        order_number: 1001,
        customer_name: "Ahmed",
        customer_phone: "0555000000",
        total: 2700,
        address: "Street 1",
        wilaya: "Algiers",
      },
      items: [{ product_name: "Product 1", quantity: 2 }],
    });

    expect(orderWebhookService.buildOrderWebhookPayload).toHaveBeenCalledWith(
      "order.created",
      expect.objectContaining({ id: "o1" }),
      [{ product_name: "Product 1", quantity: 2 }],
      { trigger: "order_create" }
    );
    expect(orderWebhookService.sendOrderWebhook).toHaveBeenCalledWith("order.created", { ok: true });
    expect(orderWebhookService.triggerOrderStatusNotification).toHaveBeenCalledWith(
      1001,
      "new",
      expect.objectContaining({
        customer_name: "Ahmed",
        items: "Product 1 × 2",
      })
    );
  });
});
