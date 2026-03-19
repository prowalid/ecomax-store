import { describe, expect, it, vi } from "vitest";
import orderStatusUpdatedWorkerModule from "../../../server/src/infrastructure/queue/workers/OrderStatusUpdatedWorker";

const { OrderStatusUpdatedWorker } = orderStatusUpdatedWorkerModule as any;

describe("OrderStatusUpdatedWorker", () => {
  it("sends webhook and status notification payloads", async () => {
    const orderWebhookService = {
      buildOrderWebhookPayload: vi.fn().mockReturnValue({ ok: true }),
      sendOrderWebhook: vi.fn().mockResolvedValue(undefined),
      triggerOrderStatusNotification: vi.fn().mockResolvedValue(undefined),
    };

    const worker = new OrderStatusUpdatedWorker({
      orderWebhookService,
      logger: { info: vi.fn() },
    });

    await worker.process({
      previousStatus: "confirmed",
      currentStatus: "shipped",
      order: {
        id: "o1",
        order_number: 1001,
        customer_name: "Ahmed",
        customer_phone: "0555000000",
        total: 2700,
        address: "Street 1",
        wilaya: "Algiers",
        tracking_number: "TRK1",
        shipping_company: "yalidine",
      },
      items: [{ product_name: "Product 1", quantity: 2 }],
    });

    expect(orderWebhookService.buildOrderWebhookPayload).toHaveBeenCalledWith(
      "order.status_updated",
      expect.objectContaining({ id: "o1" }),
      [{ product_name: "Product 1", quantity: 2 }],
      {
        trigger: "order_status_update",
        previous_status: "confirmed",
        current_status: "shipped",
      }
    );
    expect(orderWebhookService.sendOrderWebhook).toHaveBeenCalledWith("order.status_updated", { ok: true });
    expect(orderWebhookService.triggerOrderStatusNotification).toHaveBeenCalledWith(
      1001,
      "shipped",
      expect.objectContaining({
        tracking_number: "TRK1",
        shipping_company: "yalidine",
        items: "Product 1 × 2",
      })
    );
  });
});
