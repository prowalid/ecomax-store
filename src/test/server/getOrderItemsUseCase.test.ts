import { describe, expect, it, vi } from "vitest";
import getOrderItemsUseCaseModule from "../../../server/src/application/use-cases/orders/GetOrderItems";

const { GetOrderItemsUseCase } = getOrderItemsUseCaseModule as any;

describe("GetOrderItemsUseCase", () => {
  it("returns the items for a specific order", async () => {
    const orderRepository = {
      findAllItemsByOrderId: vi.fn().mockResolvedValue([
        { id: "i1", order_id: "o1", product_name: "منتج 1" },
      ]),
    };

    const useCase = new GetOrderItemsUseCase({ orderRepository });
    const result = await useCase.execute({ orderId: "o1" });

    expect(result).toEqual([
      { id: "i1", order_id: "o1", product_name: "منتج 1" },
    ]);
    expect(orderRepository.findAllItemsByOrderId).toHaveBeenCalledWith("o1");
  });
});
