import { describe, expect, it, vi } from "vitest";
import getOrdersUseCaseModule from "../../../server/src/application/use-cases/orders/GetOrders";

const { GetOrdersUseCase } = getOrdersUseCaseModule as any;

describe("GetOrdersUseCase", () => {
  it("returns the orders list from the repository", async () => {
    const orderRepository = {
      listAll: vi.fn().mockResolvedValue([
        { id: "o1", order_number: 1001 },
        { id: "o2", order_number: 1002 },
      ]),
    };

    const useCase = new GetOrdersUseCase({ orderRepository });
    const result = await useCase.execute();

    expect(result).toEqual([
      { id: "o1", order_number: 1001 },
      { id: "o2", order_number: 1002 },
    ]);
    expect(orderRepository.listAll).toHaveBeenCalledTimes(1);
  });
});
