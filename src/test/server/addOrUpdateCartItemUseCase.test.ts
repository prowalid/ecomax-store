import { beforeEach, describe, expect, it, vi } from "vitest";
import addOrUpdateCartItemUseCaseModule from "../../../server/src/application/use-cases/cart/AddOrUpdateCartItem";

const { AddOrUpdateCartItemUseCase } = addOrUpdateCartItemUseCaseModule as any;

describe("AddOrUpdateCartItemUseCase", () => {
  let cartRepository: any;
  let normalizeSelectedOptions: any;
  let useCase: any;

  beforeEach(() => {
    cartRepository = {
      findMatchingItem: vi.fn(),
      updateQuantityById: vi.fn(),
      createItem: vi.fn(),
    };
    normalizeSelectedOptions = vi.fn((value) => value ?? {});

    useCase = new AddOrUpdateCartItemUseCase({
      cartRepository,
      normalizeSelectedOptions,
    });
  });

  it("increments quantity when the same cart item already exists", async () => {
    cartRepository.findMatchingItem.mockResolvedValue({ id: "i1", quantity: 2 });
    cartRepository.updateQuantityById.mockResolvedValue({ id: "i1", quantity: 5 });

    const result = await useCase.execute({
      body: {
        session_id: "validSessionId_12345",
        product_id: "p1",
        selected_options: { Size: "L" },
        quantity: 3,
      },
    });

    expect(normalizeSelectedOptions).toHaveBeenCalledWith({ Size: "L" });
    expect(cartRepository.updateQuantityById).toHaveBeenCalledWith("i1", 5);
    expect(result).toEqual({ id: "i1", quantity: 5 });
  });

  it("creates a new cart item when no matching item exists", async () => {
    cartRepository.findMatchingItem.mockResolvedValue(null);
    cartRepository.createItem.mockResolvedValue({ id: "i2", quantity: 1 });

    const result = await useCase.execute({
      body: {
        session_id: "validSessionId_12345",
        product_id: "p1",
        product_name: "Product 1",
        product_price: 1200,
        product_image_url: "/uploads/a.jpg",
        selected_options: { Size: "M" },
      },
    });

    expect(cartRepository.createItem).toHaveBeenCalledWith({
      sessionId: "validSessionId_12345",
      productId: "p1",
      productName: "Product 1",
      selectedOptions: { Size: "M" },
      productPrice: 1200,
      productImageUrl: "/uploads/a.jpg",
      quantity: 1,
    });
    expect(result).toEqual({ id: "i2", quantity: 1 });
  });
});
