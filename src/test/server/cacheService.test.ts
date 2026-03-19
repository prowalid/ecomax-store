import { describe, expect, it, vi } from "vitest";
import cacheServiceModule from "../../../server/src/application/services/CacheService";
import inMemoryCacheModule from "../../../server/src/infrastructure/cache/InMemoryCache";

const { CacheService } = cacheServiceModule;
const { InMemoryCache } = inMemoryCacheModule;

describe("CacheService", () => {
  it("returns cached values without reloading", async () => {
    const cacheService = new CacheService(new InMemoryCache());
    const loader = vi.fn().mockResolvedValue(["a", "b"]);

    const first = await cacheService.getOrSet("products:list:public", 10_000, loader);
    const second = await cacheService.getOrSet("products:list:public", 10_000, loader);

    expect(first).toEqual(["a", "b"]);
    expect(second).toEqual(["a", "b"]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("invalidates cache entries by prefix", async () => {
    const cacheService = new CacheService(new InMemoryCache());
    const loader = vi.fn().mockResolvedValue(["cached"]);

    await cacheService.getOrSet("products:list:public", 10_000, loader);
    cacheService.invalidateByPrefix("products:");
    await cacheService.getOrSet("products:list:public", 10_000, loader);

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
