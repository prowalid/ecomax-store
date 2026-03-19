import { beforeEach, describe, expect, it, vi } from "vitest";
import createOrderUseCaseModule from "../../../server/src/application/use-cases/orders/CreateOrder";

const { CreateOrderUseCase } = createOrderUseCaseModule;

describe("CreateOrderUseCase", () => {
  let orderRepository: any;
  let normalizeSelectedOptions: any;
  let eventBus: any;
  let useCase: any;

  beforeEach(() => {
    orderRepository = {
      withTransaction: vi.fn(async (callback: any) => callback({ tx: true })),
      lockProducts: vi.fn(),
      calculateOrderDraft: vi.fn(),
      createOrder: vi.fn(),
      insertOrderItems: vi.fn(),
      adjustStock: vi.fn(),
    };

    normalizeSelectedOptions = vi.fn((value) => value ?? {});
    eventBus = { publish: vi.fn() };

    useCase = new CreateOrderUseCase({
      orderRepository,
      normalizeSelectedOptions,
      eventBus,
    });
  });

  it("creates an order and publishes order.created", async () => {
    const body = {
      customer_name: "Ahmed",
      customer_phone: "0555000000",
      shipping_cost: 300,
      items: [
        {
          product_id: "p1",
          quantity: 2,
          selected_options: { Size: "L" },
        },
      ],
    };

    orderRepository.lockProducts.mockResolvedValue([
      { id: "p1", name: "Product 1", price: 1200, stock: 5 },
    ]);
    orderRepository.calculateOrderDraft.mockReturnValue({
      orderData: {
        customer_name: "Ahmed",
        customer_phone: "0555000000",
        subtotal: 2400,
        shipping_cost: 300,
        total: 2700,
      },
      normalizedItems: [
        {
          product_id: "p1",
          product_name: "Product 1",
          quantity: 2,
          unit_price: 1200,
          total: 2400,
          selected_options: { Size: "L" },
        },
      ],
    });
    orderRepository.createOrder.mockResolvedValue({
      id: "o1",
      order_number: 1001,
      customer_name: "Ahmed",
      customer_phone: "0555000000",
      total: 2700,
    });

    const result = await useCase.execute({
      body,
      requestIp: "127.0.0.1",
    });

    expect(orderRepository.lockProducts).toHaveBeenCalled();
    expect(normalizeSelectedOptions).toHaveBeenCalledWith({ Size: "L" });
    expect(orderRepository.insertOrderItems).toHaveBeenCalled();
    expect(orderRepository.adjustStock).toHaveBeenCalledWith(
      { tx: true },
      expect.any(Array),
      -1
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "order.created",
        payload: {
          order: result.newOrder,
          items: result.normalizedItems,
        },
      })
    );
  });

  it("rejects when one or more products are missing", async () => {
    orderRepository.lockProducts.mockResolvedValue([]);

    await expect(
      useCase.execute({
        body: {
          shipping_cost: 0,
          items: [{ product_id: "missing", quantity: 1, selected_options: {} }],
        },
        requestIp: "127.0.0.1",
      })
    ).rejects.toMatchObject({
      message: "One or more products are missing.",
      status: 400,
    });

    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
