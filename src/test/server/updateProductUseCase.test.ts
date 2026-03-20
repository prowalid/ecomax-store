import { describe, expect, it, vi } from "vitest";
import updateProductUseCaseModule from "../../../server/src/application/use-cases/products/UpdateProduct";

const { UpdateProductUseCase } = updateProductUseCaseModule;

describe("UpdateProductUseCase", () => {
  it("normalizes custom options before persisting", async () => {
    const productRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "p1",
        name: "Product A",
        slug: "product-a",
        description: "",
        price: 1000,
        compare_price: null,
        cost_price: null,
        stock: 5,
        sku: null,
        category_id: null,
        image_url: "/uploads/old.png",
        custom_options: [],
        status: "active",
        version: 3,
      }),
      update: vi.fn().mockResolvedValue({ id: "p1", image_url: "/uploads/new.png" }),
    };

    const normalizeCustomOptions = vi.fn().mockReturnValue([
      { name: "Size", values: ["M", "L"] },
    ]);

    const useCase = new UpdateProductUseCase({
      productRepository,
      normalizeCustomOptions,
      cacheService: { invalidateByPrefix: vi.fn() },
    });

    const result = await useCase.execute({
      productId: "p1",
      updates: {
        version: 3,
        custom_options: [{ name: " Size ", values: ["M", "M", "L"] }],
      },
    });

    expect(normalizeCustomOptions).toHaveBeenCalled();
    expect(productRepository.update).toHaveBeenCalledTimes(1);
    expect(productRepository.update.mock.calls[0][0]).toBe("p1");
    expect(productRepository.update.mock.calls[0][1].toPersistence()).toMatchObject({
      name: "Product A",
      slug: "product-a",
      price: 1000,
      stock: 5,
      image_url: "/uploads/old.png",
      custom_options: [{ name: "Size", values: ["M", "L"] }],
    });
    expect(productRepository.update.mock.calls[0][2]).toBe(3);
    expect(result).toEqual({
      previousImageUrl: "/uploads/old.png",
      updatedProduct: { id: "p1", image_url: "/uploads/new.png" },
    });
  });

  it("throws when the product does not exist", async () => {
    const useCase = new UpdateProductUseCase({
      productRepository: {
        findById: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      normalizeCustomOptions: vi.fn(),
      cacheService: { invalidateByPrefix: vi.fn() },
    });

    await expect(
      useCase.execute({
        productId: "missing",
        updates: { name: "New name", version: 1 },
      })
    ).rejects.toMatchObject({
      message: "Product not found",
      status: 404,
    });
  });

  it("regenerates slug when the name changes", async () => {
    const productRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "p1",
        name: "Product A",
        slug: "product-a",
        description: "",
        price: 1000,
        compare_price: null,
        cost_price: null,
        stock: 5,
        sku: null,
        category_id: null,
        image_url: "/uploads/old.png",
        custom_options: [],
        status: "active",
        version: 3,
      }),
      findBySlugExcludingId: vi
        .fn()
        .mockResolvedValueOnce({ id: "p2" })
        .mockResolvedValueOnce(null),
      update: vi.fn().mockResolvedValue({ id: "p1", slug: "new-product-name-2" }),
    };

    const useCase = new UpdateProductUseCase({
      productRepository,
      normalizeCustomOptions: vi.fn(),
      cacheService: { invalidateByPrefix: vi.fn() },
    });

    await useCase.execute({
      productId: "p1",
      updates: {
        version: 3,
        name: "New Product Name",
      },
    });

    expect(productRepository.findBySlugExcludingId).toHaveBeenNthCalledWith(1, "new-product-name", "p1");
    expect(productRepository.findBySlugExcludingId).toHaveBeenNthCalledWith(2, "new-product-name-2", "p1");
    expect(productRepository.update.mock.calls[0][1].toPersistence()).toMatchObject({
      name: "New Product Name",
      slug: "new-product-name-2",
    });
  });
});
