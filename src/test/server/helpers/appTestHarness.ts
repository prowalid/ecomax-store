import { EventEmitter } from "node:events";
import { IncomingMessage } from "node:http";
import { PassThrough } from "node:stream";
import errorHandlerModule from "../../../../server/src/presentation/middleware/errorHandler";
import cacheServiceModule from "../../../../server/src/application/services/CacheService";
import inMemoryCacheModule from "../../../../server/src/infrastructure/cache/InMemoryCache";
import getHealthStatusUseCaseModule from "../../../../server/src/application/use-cases/health/GetHealthStatus";
import metricsServiceModule from "../../../../server/src/infrastructure/services/MetricsService";
import inlineQueueManagerModule from "../../../../server/src/infrastructure/queue/InlineQueueManager";
import localFileStorageModule from "../../../../server/src/infrastructure/storage/LocalFileStorage";

const { errorHandler } = errorHandlerModule as any;
const { CacheService } = cacheServiceModule as any;
const { InMemoryCache } = inMemoryCacheModule as any;
const { GetHealthStatusUseCase } = getHealthStatusUseCaseModule as any;
const { MetricsService } = metricsServiceModule as any;
const { InlineQueueManager } = inlineQueueManagerModule as any;
const { LocalFileStorage } = localFileStorageModule as any;

export function createTestContainer(overrides: Record<string, unknown> = {}) {
  const cacheStore = new InMemoryCache();
  const cacheService = new CacheService(cacheStore);
  const queueManager = new InlineQueueManager();
  const metricsService = new MetricsService({ collectDefaultMetrics: false, prefix: "test_" });
  const fileStorage = new LocalFileStorage({
    uploadsDir: "/tmp/etk-test-uploads",
    publicPrefix: "/uploads",
    now: () => 1,
    random: () => 0.1,
  });
  const pool = {
    query: async () => ({ rows: [{ now: new Date().toISOString() }] }),
  };
  const services = new Map<string, unknown>([
    [
      "logger",
      (() => {
        const baseLogger: any = {
          stream: {
            write: () => {},
          },
          info: () => {},
          warn: () => {},
          error: () => {},
          child(meta: Record<string, unknown>) {
            return {
              ...this,
              meta,
            };
          },
        };
        baseLogger.withRequestContext = (logger: any, requestId: string, extraMeta: Record<string, unknown> = {}) =>
          logger.child({ requestId, ...extraMeta });
        return baseLogger;
      })(),
    ],
    [
      "pool",
      pool,
    ],
    ["errorHandler", { errorHandler }],
    [
      "getVersionPayload",
      () => ({
        version: "test",
      }),
    ],
    ["cacheStore", cacheStore],
    ["cacheService", cacheService],
    ["queueManager", queueManager],
    ["fileStorage", fileStorage],
    ["metricsConfig", { enabled: true, token: "", prefix: "test_", collectDefaultMetrics: false }],
    ["metricsService", metricsService],
    [
      "validateOrderSecurityUseCase",
      {
        execute: async () => ({ allowed: true }),
      },
    ],
    [
      "getHealthStatusUseCase",
      new GetHealthStatusUseCase({
        pool,
        cacheStore,
        queueManager,
        getVersionPayload: () => ({ version: "test" }),
      }),
    ],
  ]);

  for (const [key, value] of Object.entries(overrides)) {
    services.set(key, value);
  }

  if (!overrides.getHealthStatusUseCase) {
    services.set(
      "getHealthStatusUseCase",
      new GetHealthStatusUseCase({
        pool: services.get("pool"),
        cacheStore: services.get("cacheStore"),
        queueManager: services.get("queueManager"),
        getVersionPayload: services.get("getVersionPayload"),
      })
    );
  }

  return {
    resolve(name: string) {
      if (!services.has(name)) {
        throw new Error(`Missing test service: ${name}`);
      }

      return services.get(name);
    },
  };
}

class TestHeaders {
  private readonly values = new Map<string, string>();

  set(name: string, value: string | string[]) {
    const normalized = name.toLowerCase();
    this.values.set(normalized, Array.isArray(value) ? value.join(", ") : String(value));
  }

  get(name: string) {
    return this.values.get(name.toLowerCase()) ?? null;
  }

  entries() {
    return this.values.entries();
  }

  delete(name: string) {
    this.values.delete(name.toLowerCase());
  }
}

class TestResponse {
  constructor(
    public readonly status: number,
    public readonly headers: TestHeaders,
    private readonly bodyBuffer: Buffer
  ) {}

  async text() {
    return this.bodyBuffer.toString("utf8");
  }

  async json() {
    const text = await this.text();
    return text ? JSON.parse(text) : null;
  }
}

function normalizeHeaders(input: HeadersInit | undefined) {
  const headers: Record<string, string> = {};

  if (!input) {
    return headers;
  }

  const append = (key: string, value: string) => {
    headers[key.toLowerCase()] = value;
  };

  if (Array.isArray(input)) {
    for (const [key, value] of input) {
      append(key, value);
    }
    return headers;
  }

  if (typeof Headers !== "undefined" && input instanceof Headers) {
    input.forEach((value, key) => append(key, value));
    return headers;
  }

  for (const [key, value] of Object.entries(input)) {
    append(key, String(value));
  }

  return headers;
}

function createMockResponse() {
  const emitter = new EventEmitter();
  const headers = new TestHeaders();
  const chunks: Buffer[] = [];

  const res: any = {
    statusCode: 200,
    statusMessage: "OK",
    locals: {},
    headersSent: false,
    finished: false,
    writableEnded: false,
    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
    emit: emitter.emit.bind(emitter),
    removeListener: emitter.removeListener.bind(emitter),
    setHeader(name: string, value: string | string[]) {
      headers.set(name, value);
    },
    getHeader(name: string) {
      return headers.get(name);
    },
    getHeaders() {
      return Object.fromEntries(headers.entries());
    },
    getHeaderNames() {
      return Array.from(headers.entries(), ([key]) => key);
    },
    hasHeader(name: string) {
      return headers.get(name) !== null;
    },
    removeHeader(name: string) {
      headers.delete(name);
    },
    writeHead(statusCode: number, maybeHeaders?: Record<string, string>) {
      this.statusCode = statusCode;
      if (maybeHeaders && typeof maybeHeaders === "object") {
        for (const [key, value] of Object.entries(maybeHeaders)) {
          this.setHeader(key, value);
        }
      }
      this.headersSent = true;
      return this;
    },
    write(chunk: any) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      this.headersSent = true;
      return true;
    },
    end(chunk?: any) {
      if (chunk) {
        this.write(chunk);
      }
      this.headersSent = true;
      this.finished = true;
      this.writableEnded = true;
      this.emit("finish");
      return this;
    },
  };

  return {
    res,
    toResponse() {
      return new TestResponse(res.statusCode, headers, Buffer.concat(chunks));
    },
  };
}

async function performRequest(app: any, path: string, init: RequestInit = {}) {
  const url = new URL(path, "http://etk.test");
  const headers = normalizeHeaders(init.headers);
  const method = (init.method || "GET").toUpperCase();
  const bodyText = typeof init.body === "string" ? init.body : init.body ? String(init.body) : "";
  const bodyBuffer = bodyText ? Buffer.from(bodyText) : null;

  if (bodyBuffer && !headers["content-length"]) {
    headers["content-length"] = String(bodyBuffer.length);
  }

  if (!headers.host) {
    headers.host = "etk.test";
  }

  if (!headers["user-agent"]) {
    headers["user-agent"] = "undici";
  }

  return await new Promise<TestResponse>((resolve, reject) => {
    const socket: any = new PassThrough();
    socket.remoteAddress = "127.0.0.1";
    socket.writable = true;
    socket.destroyed = false;

    const req: any = new IncomingMessage(socket);
    req.method = method;
    req.url = `${url.pathname}${url.search}`;
    req.headers = headers;
    req.connection = socket;
    req.socket = socket;
    req.httpVersion = "1.1";

    const { res, toResponse } = createMockResponse();
    res.socket = socket;
    res.connection = socket;

    res.once("finish", () => resolve(toResponse()));

    app.handle(req, res, (error: Error | undefined) => {
      if (error) {
        reject(error);
        return;
      }

      if (!res.writableEnded) {
        res.statusCode = res.statusCode || 404;
        res.end();
      }
    });

    queueMicrotask(() => {
      if (bodyBuffer) {
        req.push(bodyBuffer);
      }
      req.push(null);
    });
  });
}

export async function withTestApp(
  container: ReturnType<typeof createTestContainer>,
  run: (client: {
    fetch: (path: string, init?: RequestInit) => Promise<TestResponse>;
    getJson: (path: string, init?: RequestInit) => Promise<{ response: TestResponse; json: any }>;
  }) => Promise<void>
) {
  const appModule = (await import("../../../../server/src/app")) as any;
  const { createApp } = appModule;
  const app = createApp(container);
  await run({
    fetch(path: string, init?: RequestInit) {
      return performRequest(app, path, init);
    },
    async getJson(path: string, init?: RequestInit) {
      const response = await performRequest(app, path, init);
      const text = await response.text();
      return {
        response,
        json: text ? JSON.parse(text) : null,
      };
    },
  });
}
