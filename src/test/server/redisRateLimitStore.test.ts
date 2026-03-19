import { describe, expect, it, vi } from "vitest";
import { EventEmitter } from "events";
import redisRateLimitStoreModule from "../../../server/src/infrastructure/rate-limit/RedisRateLimitStore";

const { RedisRateLimitStore } = redisRateLimitStoreModule as any;

describe("RedisRateLimitStore", () => {
  it("resets all scanned keys by passing them as individual DEL arguments", async () => {
    const stream = new EventEmitter();
    const del = vi.fn().mockResolvedValue(2);

    const store = Object.create(RedisRateLimitStore.prototype);
    store.keyPrefix = "etk:rate-limit:";
    store.client = {
      scanStream: vi.fn().mockReturnValue(stream),
      del,
    };

    const resetPromise = store.reset();

    stream.emit("data", ["etk:rate-limit:1.1.1.1", "etk:rate-limit:2.2.2.2"]);
    stream.emit("end");

    await resetPromise;

    expect(store.client.scanStream).toHaveBeenCalledWith({
      match: "etk:rate-limit:*",
      count: 100,
    });
    expect(del).toHaveBeenCalledWith("etk:rate-limit:1.1.1.1", "etk:rate-limit:2.2.2.2");
  });
});
