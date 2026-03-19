import { describe, expect, it, vi } from "vitest";
import orderWebhookServiceModule from "../../../server/src/infrastructure/services/OrderWebhookService";
import circuitBreakerModule from "../../../server/src/infrastructure/services/CircuitBreaker";

const { OrderWebhookService } = orderWebhookServiceModule as any;
const { CircuitBreaker } = circuitBreakerModule as any;

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

  it("skips webhook delivery when the circuit is already open", async () => {
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const breaker = new CircuitBreaker({
      name: "order-webhook",
      logger,
      failureThreshold: 1,
      resetTimeoutMs: 60_000,
    });

    await expect(
      breaker.execute(async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");

    const service = new OrderWebhookService({
      settingsRepository: {
        findValuesByKeys: async () => [{ value: { webhook_url: "https://example.com/hook" } }],
        findValueByKey: async () => ({}),
      },
      logger,
      whatsAppMessagingService: {
        send: async () => ({ success: true }),
      },
      breaker,
    });

    const result = await service.sendOrderWebhook("order.created", {
      event: { id: "evt-1", occurred_at: new Date().toISOString() },
      order: { order_id: 1001 },
    });

    expect(result).toEqual({
      success: false,
      skipped: false,
      reason: "circuit_open",
    });
    expect(logger.warn).toHaveBeenCalled();
  });
});
