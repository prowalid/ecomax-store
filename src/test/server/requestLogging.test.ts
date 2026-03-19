import { describe, expect, it, vi } from "vitest";
import requestLoggingModule from "../../../server/src/presentation/middleware/requestLogging";

const { requestLogging } = requestLoggingModule as any;

describe("requestLogging middleware", () => {
  it("logs structured request metadata on response finish", async () => {
    const logger = {
      info: vi.fn(),
    };
    const middleware = requestLogging;
    const req = {
      method: "POST",
      originalUrl: "/api/orders",
      headers: {
        "user-agent": "undici",
        "cf-connecting-ip": "1.2.3.4",
      },
      logger,
      socket: { remoteAddress: "127.0.0.1" },
    };
    const listeners = new Map<string, (() => void)[]>();
    const res = {
      statusCode: 201,
      on(name: string, listener: () => void) {
        const current = listeners.get(name) || [];
        current.push(listener);
        listeners.set(name, current);
      },
      getHeader(name: string) {
        if (name === "content-length") return "128";
        return null;
      },
    };

    middleware(req, res, vi.fn());

    for (const listener of listeners.get("finish") || []) {
      listener();
    }

    expect(logger.info).toHaveBeenCalledWith(
      "HTTP request completed",
      expect.objectContaining({
        context: "http",
        method: "POST",
        path: "/api/orders",
        statusCode: 201,
        clientIp: "1.2.3.4",
        userAgent: "undici",
        contentLength: "128",
        responseTimeMs: expect.any(Number),
      })
    );
  });
});
