import { describe, expect, it, vi } from "vitest";
import idempotencyModule from "../../../server/src/presentation/middleware/idempotency";
import cacheServiceModule from "../../../server/src/application/services/CacheService";
import inMemoryCacheModule from "../../../server/src/infrastructure/cache/InMemoryCache";

const { createIdempotencyMiddleware } = idempotencyModule as any;
const { CacheService } = cacheServiceModule as any;
const { InMemoryCache } = inMemoryCacheModule as any;

function createResponseMock() {
  return {
    headers: new Map<string, string>(),
    statusCode: 200,
    body: null as unknown,
    listeners: new Map<string, (() => void)[]>(),
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
      return this;
    },
    on(name: string, listener: () => void) {
      const current = this.listeners.get(name) || [];
      current.push(listener);
      this.listeners.set(name, current);
      return this;
    },
    async emit(name: string) {
      const listeners = this.listeners.get(name) || [];
      for (const listener of listeners) {
        await listener();
      }
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    async json(payload: unknown) {
      this.body = payload;
      await this.emit("finish");
      return this;
    },
  };
}

describe("idempotency middleware", () => {
  it("replays a completed response for the same idempotency key", async () => {
    const cacheService = new CacheService(new InMemoryCache());
    const middleware = createIdempotencyMiddleware({ cacheService });
    const next = vi.fn();

    const firstReq = {
      method: "POST",
      originalUrl: "/api/orders",
      headers: { "idempotency-key": "order-123" },
      body: { customer_name: "Ahmed", total: 1500 },
    };
    const firstRes = createResponseMock();

    await middleware(firstReq, firstRes, next);
    expect(next).toHaveBeenCalledTimes(1);

    firstRes.status(201);
    await firstRes.json({ id: "o1", order_number: 1001 });

    const replayReq = {
      method: "POST",
      originalUrl: "/api/orders",
      headers: { "idempotency-key": "order-123" },
      body: { customer_name: "Ahmed", total: 1500 },
    };
    const replayRes = createResponseMock();

    await middleware(replayReq, replayRes, vi.fn());

    expect(replayRes.statusCode).toBe(201);
    expect(replayRes.headers.get("x-idempotent-replayed")).toBe("true");
    expect(replayRes.body).toEqual({ id: "o1", order_number: 1001 });
  });

  it("rejects reuse of the same idempotency key with a different payload", async () => {
    const cacheService = new CacheService(new InMemoryCache());
    const middleware = createIdempotencyMiddleware({ cacheService });

    const firstReq = {
      method: "POST",
      originalUrl: "/api/orders",
      headers: { "idempotency-key": "order-456" },
      body: { customer_name: "Ahmed", total: 1500 },
    };
    const firstRes = createResponseMock();

    await middleware(firstReq, firstRes, vi.fn());
    firstRes.status(201);
    await firstRes.json({ id: "o1" });

    const conflictingReq = {
      method: "POST",
      originalUrl: "/api/orders",
      headers: { "idempotency-key": "order-456" },
      body: { customer_name: "Sara", total: 3200 },
    };
    const conflictingRes = createResponseMock();

    await middleware(conflictingReq, conflictingRes, vi.fn());

    expect(conflictingRes.statusCode).toBe(409);
    expect(conflictingRes.body).toEqual({
      error: "Idempotency key reuse conflict",
      code: "IDEMPOTENCY_KEY_CONFLICT",
    });
  });
});
