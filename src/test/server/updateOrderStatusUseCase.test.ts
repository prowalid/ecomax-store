import { beforeEach, describe, expect, it, vi } from "vitest";
import updateOrderStatusUseCaseModule from "../../../server/src/application/use-cases/orders/UpdateOrderStatus";

const { UpdateOrderStatusUseCase } = updateOrderStatusUseCaseModule;

describe("UpdateOrderStatusUseCase", () => {
  let orderRepository: any;
  let eventBus: any;
  let useCase: any;

  beforeEach(() => {
    orderRepository = {
      withTransaction: vi.fn(async (callback: any) => callback({ tx: true })),
      getStatusSnapshot: vi.fn(),
      updateStatus: vi.fn(),
      getOrderItems: vi.fn(),
      adjustStock: vi.fn(),
      getDetailedOrderItems: vi.fn(),
    };

    eventBus = { publish: vi.fn() };

    useCase = new UpdateOrderStatusUseCase({
      orderRepository,
      eventBus,
    });
  });

  it("updates status to attempt and increments call_attempts", async () => {
    orderRepository.getStatusSnapshot.mockResolvedValue({
      status: "new",
      call_attempts: 0,
    });
    orderRepository.updateStatus.mockResolvedValue({
      id: "o1",
      order_number: 1001,
      status: "attempt",
      customer_name: "Ahmed",
      customer_phone: "0555000000",
      total: 900,
    });
    orderRepository.getDetailedOrderItems.mockResolvedValue([
      { product_id: "p1", product_name: "Product 1", quantity: 1, unit_price: 900, total: 900 },
    ]);

    const result = await useCase.execute({
      orderId: "o1",
      status: "attempt",
    });

    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      { tx: true },
      "o1",
      { status: "attempt", callAttempts: 1 }
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "order.status_updated",
        payload: {
          previousStatus: "new",
          currentStatus: "attempt",
          order: result.updatedOrder,
          items: result.orderItems,
        },
      })
    );
  });

  it("restores stock when moving from consumed state to cancelled", async () => {
    orderRepository.getStatusSnapshot.mockResolvedValue({
      status: "confirmed",
      call_attempts: 1,
    });
    orderRepository.updateStatus.mockResolvedValue({
      id: "o1",
      order_number: 1001,
      status: "cancelled",
      total: 900,
    });
    orderRepository.getOrderItems.mockResolvedValue([{ product_id: "p1", quantity: 2 }]);
    orderRepository.adjustStock.mockResolvedValue([{ id: "p1", name: "Product 1", stock: 5 }]);
    orderRepository.getDetailedOrderItems.mockResolvedValue([]);

    await useCase.execute({
      orderId: "o1",
      status: "cancelled",
    });

    expect(orderRepository.adjustStock).toHaveBeenCalledWith(
      { tx: true },
      [{ product_id: "p1", quantity: 2 }],
      1
    );
  });

  it("rejects invalid status transitions", async () => {
    orderRepository.getStatusSnapshot.mockResolvedValue({
      status: "new",
      call_attempts: 0,
    });

    await expect(
      useCase.execute({
        orderId: "o1",
        status: "delivered",
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_ORDER_STATUS_TRANSITION",
    });

    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
