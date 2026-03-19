import { afterEach, describe, expect, it, vi } from "vitest";

describe("CreateOrderShipmentUseCase", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a shipment for the active provider and updates the order", async () => {
    const createOrderShipmentUseCaseModule = await import(
      "../../../server/src/application/use-cases/shipping/CreateOrderShipment"
    );
    const { CreateOrderShipmentUseCase } = createOrderShipmentUseCaseModule as any;

    const orderRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "o1",
        order_number: "1001",
        customer_name: "أحمد",
        customer_phone: "0555000000",
        wilaya: "الجزائر",
        commune: "باب الزوار",
        address: "حي 1",
        delivery_type: "home",
        total: 5000,
        subtotal: 4500,
        shipping_cost: 500,
        status: "new",
      }),
      findItemsByOrderId: vi.fn().mockResolvedValue([
        { product_name: "منتج", quantity: 1, unit_price: 4500, selected_options: {} },
      ]),
      updateShipmentInfo: vi.fn().mockResolvedValue({
        id: "o1",
        shipping_company: "yalidine",
        tracking_number: "TRK-1",
      }),
    };

    const shippingSettingsService = {
      getSettings: vi.fn().mockResolvedValue({
        provider: { active_provider: "yalidine" },
        yalidine: {
          enabled: true,
        },
      }),
    };

    const useCase = new CreateOrderShipmentUseCase({
      orderRepository,
      shippingSettingsService,
      shipmentProviders: {
        yalidine: {
          label: "Yalidine",
          settingsKey: "yalidine",
          createShipment: vi.fn().mockResolvedValue({
            tracking_number: "TRK-1",
            shipping_label_url: "https://label.example.com/1",
            response: { ok: true },
          }),
        },
      },
    });

    const result = await useCase.execute({ orderId: "o1" });

    expect(result.success).toBe(true);
    expect(result.provider).toBe("yalidine");
    expect(orderRepository.updateShipmentInfo).toHaveBeenCalledWith("o1", {
      shippingCompany: "yalidine",
      trackingNumber: "TRK-1",
      shippingLabelUrl: "https://label.example.com/1",
    });
  });
});
