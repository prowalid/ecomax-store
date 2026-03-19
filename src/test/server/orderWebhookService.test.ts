import { describe, expect, it } from "vitest";
import orderWebhookServiceModule from "../../../server/src/infrastructure/services/OrderWebhookService";

const { OrderWebhookService } = orderWebhookServiceModule as any;

describe("OrderWebhookService", () => {
  it("builds a normalized webhook payload with item summaries and options", () => {
    const service = new OrderWebhookService({
      settingsRepository: {
        findValuesByKeys: async () => [],
        findValueByKey: async () => ({}),
      },
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
      },
      whatsAppMessagingService: {
        send: async () => ({ success: true }),
      },
    });

    const payload = service.buildOrderWebhookPayload(
      "order.created",
      {
        order_number: 1001,
        customer_name: "أحمد",
        customer_phone: "0555000000",
        wilaya: "الجزائر",
        commune: "باب الزوار",
        delivery_type: "home",
        subtotal: 3000,
        shipping_cost: 400,
        total: 3400,
        status: "new",
        created_at: "2026-03-18T12:00:00.000Z",
      },
      [
        {
          product_name: "قميص",
          quantity: 2,
          unit_price: 1000,
          selected_options: { color: "Black", size: "L" },
        },
        {
          product_name: "حذاء",
          quantity: 1,
          unit_price: 1000,
          selected_options: {},
        },
      ],
      { trigger: "test" }
    );

    expect(payload.event.type).toBe("order.created");
    expect(payload.order.order_id).toBe(1001);
    expect(payload.order.quantity).toBe(3);
    expect(payload.order.product).toContain("قميص (color: Black، size: L)");
    expect(payload.items[0]).toEqual({
      product: "قميص (color: Black، size: L)",
      options: { color: "Black", size: "L" },
      quantity: 2,
      price: 1000,
    });
    expect(payload.metadata).toEqual({ trigger: "test" });
  });
});
