import { describe, expect, it, vi } from "vitest";
import redisCacheModule from "../../../server/src/infrastructure/cache/RedisCache";

const { RedisCache } = redisCacheModule as any;

describe("RedisCache", () => {
  it("deletes prefixed keys using unprefixed names when keyPrefix is configured", async () => {
    const scan = vi
      .fn()
      .mockResolvedValueOnce([
        "1",
        ["stepdz:settings:public:appearance", "stepdz:settings:admin:appearance"],
      ])
      .mockResolvedValueOnce(["0", ["stepdz:settings:public:general"]]);
    const del = vi.fn().mockResolvedValue(3);

    const cache = Object.create(RedisCache.prototype);
    cache.client = {
      options: { keyPrefix: "stepdz:" },
      scan,
      del,
    };

    await cache.deleteByPrefix("settings:");

    expect(scan).toHaveBeenCalledWith("0", "MATCH", "stepdz:settings:*", "COUNT", 100);
    expect(scan).toHaveBeenCalledWith("1", "MATCH", "stepdz:settings:*", "COUNT", 100);
    expect(del).toHaveBeenNthCalledWith(1, "settings:public:appearance", "settings:admin:appearance");
    expect(del).toHaveBeenNthCalledWith(2, "settings:public:general");
  });

  it("deletes scanned keys as-is when no keyPrefix is configured", async () => {
    const scan = vi.fn().mockResolvedValueOnce(["0", ["pages:published:header"]]);
    const del = vi.fn().mockResolvedValue(1);

    const cache = Object.create(RedisCache.prototype);
    cache.client = {
      options: {},
      scan,
      del,
    };

    await cache.deleteByPrefix("pages:");

    expect(scan).toHaveBeenCalledWith("0", "MATCH", "pages:*", "COUNT", 100);
    expect(del).toHaveBeenCalledWith("pages:published:header");
  });
});
