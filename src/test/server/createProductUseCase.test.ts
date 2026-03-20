import { describe, expect, it, vi } from "vitest";
import createProductUseCaseModule from "../../../server/src/application/use-cases/products/CreateProduct";

const { CreateProductUseCase } = createProductUseCaseModule;

describe("CreateProductUseCase", () => {
  it("generates a unique slug before persisting", async () => {
    const productRepository = {
      findBySlug: vi
        .fn()
        .mockResolvedValueOnce({ id: "existing-1" })
        .mockResolvedValueOnce(null),
      create: vi.fn().mockImplementation(async (product) => product.toPersistence()),
    };

    const useCase = new CreateProductUseCase({
      productRepository,
      normalizeCustomOptions: vi.fn().mockReturnValue([]),
      cacheService: { invalidateByPrefix: vi.fn() },
    });

    const result = await useCase.execute({
      name: "Nike Sport Shoes",
      price: 1000,
      stock: 5,
      status: "active",
    });

    expect(productRepository.findBySlug).toHaveBeenNthCalledWith(1, "nike-sport-shoes");
    expect(productRepository.findBySlug).toHaveBeenNthCalledWith(2, "nike-sport-shoes-2");
    expect(result.slug).toBe("nike-sport-shoes-2");
  });
});
