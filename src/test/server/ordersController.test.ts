import { describe, expect, it, vi } from "vitest";
import ordersControllerModule from "../../../server/src/presentation/controllers/OrdersController";

const {
  getOrders,
  getOrderItems,
  createOrderShipment,
} = ordersControllerModule as any;

function createResponseMock() {
  return {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
}

describe("ordersController", () => {
  it("delegates getOrders to the use case", async () => {
    const getOrdersUseCase = {
      execute: vi.fn().mockResolvedValue([{ id: "o1" }]),
    };
    const req = {
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(getOrdersUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await getOrders(req, res, next);

    expect(res.payload).toEqual([{ id: "o1" }]);
    expect(getOrdersUseCase.execute).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it("delegates getOrderItems to the use case", async () => {
    const getOrderItemsUseCase = {
      execute: vi.fn().mockResolvedValue([{ id: "i1", order_id: "o1" }]),
    };
    const req = {
      params: { id: "o1" },
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(getOrderItemsUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await getOrderItems(req, res, next);

    expect(res.payload).toEqual([{ id: "i1", order_id: "o1" }]);
    expect(getOrderItemsUseCase.execute).toHaveBeenCalledWith({ orderId: "o1" });
    expect(next).not.toHaveBeenCalled();
  });

  it("delegates createOrderShipment to the use case", async () => {
    const createOrderShipmentUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, provider: "yalidine" }),
    };
    const req = {
      params: { id: "o1" },
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(createOrderShipmentUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await createOrderShipment(req, res, next);

    expect(res.payload).toEqual({ success: true, provider: "yalidine" });
    expect(createOrderShipmentUseCase.execute).toHaveBeenCalledWith({ orderId: "o1" });
    expect(next).not.toHaveBeenCalled();
  });
});
