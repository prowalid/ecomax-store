import { afterEach, describe, expect, it, vi } from "vitest";
import rateLimitModule from "../../../server/src/presentation/middleware/rateLimit";

const { createRateLimit, resetRateLimitStore } = rateLimitModule as any;

function createResponseMock() {
  return {
    headers: new Map<string, string>(),
    statusCode: 200,
    body: null as unknown,
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

describe("rateLimit middleware", () => {
  afterEach(async () => {
    await resetRateLimitStore();
  });

  it("allows requests under the limit and exposes rate-limit headers", async () => {
    const middleware = createRateLimit({
      windowMs: 60_000,
      max: 2,
      message: "Too many requests",
    });
    const next = vi.fn();

    const firstReq = {
      path: "/limited",
      headers: { "x-forwarded-for": "1.1.1.1" },
      socket: { remoteAddress: "127.0.0.1" },
    };
    const firstRes = createResponseMock();

    await middleware(firstReq, firstRes, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(firstRes.headers.get("x-ratelimit-limit")).toBe("2");
    expect(firstRes.headers.get("x-ratelimit-remaining")).toBe("1");
    expect(firstRes.headers.get("x-ratelimit-reset")).toBeTruthy();

    const secondReq = {
      path: "/limited",
      headers: { "x-forwarded-for": "1.1.1.1" },
      socket: { remoteAddress: "127.0.0.1" },
    };
    const secondRes = createResponseMock();

    await middleware(secondReq, secondRes, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(secondRes.headers.get("x-ratelimit-remaining")).toBe("0");
  });

  it("blocks requests after the limit and returns retry metadata", async () => {
    const middleware = createRateLimit({
      windowMs: 60_000,
      max: 1,
      message: "Blocked",
    });
    const next = vi.fn();
    const req = {
      path: "/limited",
      headers: { "x-forwarded-for": "2.2.2.2" },
      socket: { remoteAddress: "127.0.0.1" },
    };

    await middleware(req, createResponseMock(), next);

    const blockedRes = createResponseMock();
    await middleware(req, blockedRes, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.headers.get("retry-after")).toBeTruthy();
    expect(blockedRes.body).toEqual({
      error: "Blocked",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: expect.any(Number),
    });
  });

  it("uses scope and identifier to isolate rate limits per sensitive target", async () => {
    const middleware = createRateLimit({
      scope: "auth:login",
      windowMs: 60_000,
      max: 1,
      message: "Blocked",
      identifier: (req: any) => req.body?.phone,
    });
    const next = vi.fn();

    const firstReq = {
      method: "POST",
      path: "/login",
      baseUrl: "/auth",
      body: { phone: "0555000001" },
      headers: { "x-forwarded-for": "3.3.3.3" },
      socket: { remoteAddress: "127.0.0.1" },
    };

    const secondReqDifferentPhone = {
      ...firstReq,
      body: { phone: "0555000002" },
    };

    await middleware(firstReq, createResponseMock(), next);
    await middleware(secondReqDifferentPhone, createResponseMock(), next);

    const blockedRes = createResponseMock();
    await middleware(firstReq, blockedRes, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.body).toEqual({
      error: "Blocked",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: expect.any(Number),
    });
  });
});
