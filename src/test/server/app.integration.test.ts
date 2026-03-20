import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { createTestContainer, withTestApp } from "./helpers/appTestHarness";
import cacheServiceModule from "../../../server/src/application/services/CacheService";
import inMemoryCacheModule from "../../../server/src/infrastructure/cache/InMemoryCache";
import pgSettingsRepositoryModule from "../../../server/src/infrastructure/repositories/PgSettingsRepository";
import getSettingsUseCaseModule from "../../../server/src/application/use-cases/settings/GetSettings";
import pgPageRepositoryModule from "../../../server/src/infrastructure/repositories/PgPageRepository";
import getPublishedPagesUseCaseModule from "../../../server/src/application/use-cases/pages/GetPublishedPages";
import getPageBySlugUseCaseModule from "../../../server/src/application/use-cases/pages/GetPageBySlug";
import pgCategoryRepositoryModule from "../../../server/src/infrastructure/repositories/PgCategoryRepository";
import getCategoriesUseCaseModule from "../../../server/src/application/use-cases/categories/GetCategories";
import rateLimitModule from "../../../server/src/presentation/middleware/rateLimit";

const require = createRequire(import.meta.url);
const db = require("../../../server/src/config/db");
const originalDbQuery = db.query;
const { CacheService } = cacheServiceModule as any;
const { InMemoryCache } = inMemoryCacheModule as any;
const { PgSettingsRepository } = pgSettingsRepositoryModule as any;
const { GetSettingsUseCase } = getSettingsUseCaseModule as any;
const { PgPageRepository } = pgPageRepositoryModule as any;
const { GetPublishedPagesUseCase } = getPublishedPagesUseCaseModule as any;
const { GetPageBySlugUseCase } = getPageBySlugUseCaseModule as any;
const { PgCategoryRepository } = pgCategoryRepositoryModule as any;
const { GetCategoriesUseCase } = getCategoriesUseCaseModule as any;
const { resetRateLimitStore } = rateLimitModule as any;

function createSettingsIntegrationContainer() {
  const cacheService = new CacheService(new InMemoryCache());
  const settingsRepository = new PgSettingsRepository(db);
  const getSettingsUseCase = new GetSettingsUseCase({
    settingsRepository,
    cacheService,
  });

  return createTestContainer({
    pool: db,
    cacheService,
    getSettingsUseCase,
  });
}

function createPagesIntegrationContainer() {
  const cacheService = new CacheService(new InMemoryCache());
  const pageRepository = new PgPageRepository(db);
  const getPublishedPagesUseCase = new GetPublishedPagesUseCase({
    pageRepository,
    cacheService,
  });
  const getPageBySlugUseCase = new GetPageBySlugUseCase({
    pageRepository,
    cacheService,
  });

  return createTestContainer({
    pool: db,
    cacheService,
    getPublishedPagesUseCase,
    getPageBySlugUseCase,
  });
}

function createCategoriesIntegrationContainer() {
  const cacheService = new CacheService(new InMemoryCache());
  const categoryRepository = new PgCategoryRepository(db);
  const getCategoriesUseCase = new GetCategoriesUseCase({
    categoryRepository,
    cacheService,
  });

  return createTestContainer({
    pool: db,
    cacheService,
    getCategoriesUseCase,
  });
}

describe("Express app integration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    db.query = originalDbQuery;
  });

  afterEach(async () => {
    await resetRateLimitStore();
  });

  it("serves /api/health using the configured pool", async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({
        rows: [{ now: "2026-03-18T13:00:00.000Z" }],
      }),
    };

    const container = createTestContainer({ pool });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/health");

      expect(response.status).toBe(200);
      expect(json).toEqual({
        status: "ok",
        time: "2026-03-18T13:00:00.000Z",
        database: "connected",
        cache: "connected",
        queue: "connected",
        requestId: expect.any(String),
        uptimeSeconds: expect.any(Number),
        memory: expect.any(Object),
        version: expect.any(Object),
        responseTimeMs: expect.any(Number),
        checks: {
          database: {
            status: "ok",
            responseTimeMs: expect.any(Number),
          },
          cache: {
            status: "ok",
            driver: "InMemoryCache",
            responseTimeMs: expect.any(Number),
            ping: "PONG",
          },
          queue: {
            status: "ok",
            driver: "inline",
            registeredEvents: expect.any(Number),
            responseTimeMs: expect.any(Number),
          },
        },
      });
      expect(response.headers.get("x-request-id")).toBeTruthy();
    });

    expect(pool.query).toHaveBeenCalledWith("SELECT NOW()");
  });

  it("preserves incoming x-request-id on health responses", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const response = await client.fetch("/api/health", {
        headers: {
          "x-request-id": "req-test-123",
        },
      });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get("x-request-id")).toBe("req-test-123");
      expect(json.requestId).toBe("req-test-123");
    });
  });

  it("exposes readiness checks on /api/health/ready", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/health/ready");

      expect(response.status).toBe(200);
      expect(json).toEqual({
        status: "ok",
        requestId: expect.any(String),
        checks: {
          database: {
            status: "ok",
            responseTimeMs: expect.any(Number),
          },
          cache: {
            status: "ok",
            driver: "InMemoryCache",
            responseTimeMs: expect.any(Number),
            ping: "PONG",
          },
          queue: {
            status: "ok",
            driver: "inline",
            registeredEvents: expect.any(Number),
            responseTimeMs: expect.any(Number),
          },
        },
      });
    });
  });

  it("exposes liveness checks on /api/health/live", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/health/live");

      expect(response.status).toBe(200);
      expect(json).toEqual({
        status: "ok",
        requestId: expect.any(String),
        uptimeSeconds: expect.any(Number),
      });
    });
  });

  it("serves prometheus metrics when enabled", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const response = await client.fetch("/api/metrics");
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/plain");
      expect(text).toContain("test_http_requests_total");
    });
  });

  it("protects /api/metrics when a token is configured", async () => {
    const container = createTestContainer({
      metricsConfig: { enabled: true, token: "secret-token", prefix: "test_", collectDefaultMetrics: false },
    });

    await withTestApp(container, async (client) => {
      const unauthorized = await client.fetch("/api/metrics");
      expect(unauthorized.status).toBe(401);

      const authorized = await client.fetch("/api/metrics", {
        headers: {
          authorization: "Bearer secret-token",
        },
      });

      expect(authorized.status).toBe(200);
      expect(await authorized.text()).toContain("test_http_requests_total");
    });
  });

  it("serves the raw OpenAPI specification on /api/openapi.json", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/openapi.json");

      expect(response.status).toBe(200);
      expect(json).toMatchObject({
        openapi: "3.0.3",
        info: {
          title: "Express Trade Kit API",
        },
        paths: expect.objectContaining({
          "/health": expect.any(Object),
          "/auth/login": expect.any(Object),
          "/orders": expect.any(Object),
          "/products": expect.any(Object),
          "/categories": expect.any(Object),
          "/settings/{key}": expect.any(Object),
        }),
      });
    });
  });

  it("applies hardened security headers on API responses", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const response = await client.fetch("/api/health");

      expect(response.status).toBe(200);
      expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("cross-origin-resource-policy")).toBe("cross-origin");
    });
  });

  it("caches GET /api/products responses between requests", async () => {
    const listProductsUseCase = {
      execute: vi.fn().mockResolvedValue([
        { id: 1, name: "Product A" },
        { id: 2, name: "Product B" },
      ]),
    };

    const container = createTestContainer({ listProductsUseCase });

    await withTestApp(container, async (client) => {
      const first = await client.getJson("/api/products");
      const second = await client.getJson("/api/products");

      expect(first.response.status).toBe(200);
      expect(second.response.status).toBe(200);
      expect(first.json).toEqual(second.json);
    });

    expect(listProductsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(listProductsUseCase.execute).toHaveBeenCalledWith({
      user: undefined,
      search: undefined,
      categoryId: undefined,
      sort: "newest",
      inStockOnly: false,
      onSaleOnly: false,
      status: undefined,
      page: 1,
      limit: 20,
      paginate: false,
    });
  });

  it("forwards discovery filters on GET /api/products", async () => {
    const listProductsUseCase = {
      execute: vi.fn().mockResolvedValue([{ id: 1, name: "Search Match", category_name: "Phones" }]),
    };

    const container = createTestContainer({ listProductsUseCase });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/products?search=phone&category_id=cat-1&sort=price_asc");

      expect(response.status).toBe(200);
      expect(json).toEqual([
        expect.objectContaining({
          id: 1,
          name: "Search Match",
          category_name: "Phones",
        }),
      ]);
    });

    expect(listProductsUseCase.execute).toHaveBeenCalledWith({
      user: undefined,
      search: "phone",
      categoryId: "cat-1",
      sort: "price_asc",
      inStockOnly: false,
      onSaleOnly: false,
      status: undefined,
      page: 1,
      limit: 20,
      paginate: false,
    });
  });

  it("forwards boolean discovery filters on GET /api/products", async () => {
    const listProductsUseCase = {
      execute: vi.fn().mockResolvedValue([{ id: 2, name: "Offer Match" }]),
    };

    const container = createTestContainer({ listProductsUseCase });

    await withTestApp(container, async (client) => {
      const { response } = await client.getJson("/api/products?in_stock=1&on_sale=1");
      expect(response.status).toBe(200);
    });

    expect(listProductsUseCase.execute).toHaveBeenCalledWith({
      user: undefined,
      search: undefined,
      categoryId: undefined,
      sort: "newest",
      inStockOnly: true,
      onSaleOnly: true,
      status: undefined,
      page: 1,
      limit: 20,
      paginate: false,
    });
  });

  it("returns paginated products payload when page or limit is provided", async () => {
    const listProductsUseCase = {
      execute: vi.fn().mockResolvedValue({
        items: [{ id: 3, name: "Paged Product", slug: "paged-product" }],
        pagination: {
          page: 2,
          limit: 12,
          total: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      }),
    };

    const container = createTestContainer({ listProductsUseCase });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/products?page=2&limit=12");

      expect(response.status).toBe(200);
      expect(json).toEqual({
        items: [
          expect.objectContaining({
            id: 3,
            name: "Paged Product",
            slug: "paged-product",
          }),
        ],
        pagination: {
          page: 2,
          limit: 12,
          total: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });

    expect(listProductsUseCase.execute).toHaveBeenCalledWith({
      user: undefined,
      search: undefined,
      categoryId: undefined,
      sort: "newest",
      inStockOnly: false,
      onSaleOnly: false,
      status: undefined,
      page: 2,
      limit: 12,
      paginate: true,
    });
  });

  it("handles POST /api/auth/login and sets auth cookies", async () => {
    const loginUseCase = {
      execute: vi.fn().mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        ttl: {
          accessMs: 60_000,
          refreshMs: 120_000,
        },
        user: {
          id: "u1",
          name: "Admin",
          phone: "0555000000",
          role: "admin",
          two_factor_enabled: false,
        },
      }),
    };

    const container = createTestContainer({ loginUseCase });

    await withTestApp(container, async (client) => {
      const response = await client.fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          phone: "0555000000",
          password: "secret123",
        }),
      });

      const json = await response.json();
      const setCookie = response.headers.get("set-cookie") || "";

      expect(response.status).toBe(200);
      expect(json.user.id).toBe("u1");
      expect(setCookie).toContain("etk_access_token=");
    });

    expect(loginUseCase.execute).toHaveBeenCalledWith({
      phone: "0555000000",
      password: "secret123",
      twoFactorCode: undefined,
      requestMeta: {
        userAgent: "undici",
        ipAddress: "127.0.0.1",
      },
    });
  });

  it("handles POST /api/customers through the customer use case", async () => {
    const createOrUpdateCustomerUseCase = {
      execute: vi.fn().mockResolvedValue({
        created: true,
        customer: {
          id: "c1",
          name: "Ahmed",
          phone: "0555000000",
        },
      }),
    };

    const container = createTestContainer({ createOrUpdateCustomerUseCase });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/customers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Ahmed",
          phone: "0555000000",
        }),
      });

      expect(response.status).toBe(201);
      expect(json).toEqual({
        id: "c1",
        name: "Ahmed",
        phone: "0555000000",
      });
    });
  });

  it("handles POST /api/cart through the cart use case", async () => {
    const addOrUpdateCartItemUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: "i1",
        session_id: "validSessionId_12345",
        quantity: 1,
      }),
    };

    const container = createTestContainer({ addOrUpdateCartItemUseCase });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/cart", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          session_id: "validSessionId_12345",
          product_id: "550e8400-e29b-41d4-a716-446655440000",
          product_name: "Product 1",
          product_price: 1200,
          quantity: 1,
          selected_options: { Size: "M" },
        }),
      });

      expect(response.status).toBe(201);
      expect(json.id).toBe("i1");
    });
  });

  it("handles PATCH /api/cart/:itemId quantity updates through the cart use case", async () => {
    const updateCartItemQuantityUseCase = {
      execute: vi.fn().mockResolvedValue({
        deleted: false,
        item: {
          id: "i1",
          quantity: 4,
        },
      }),
    };

    const container = createTestContainer({ updateCartItemQuantityUseCase });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/cart/i1", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          session_id: "validSessionId_12345",
          quantity: 4,
        }),
      });

      expect(response.status).toBe(200);
      expect(json).toEqual({
        id: "i1",
        quantity: 4,
      });
    });
  });

  it("filters public marketing settings over HTTP", async () => {
    db.query = vi.fn().mockResolvedValue({
      rows: [
        {
          value: {
            pixel_id: "123",
            facebook_pixel_id: "fb-456",
            enabled_events: ["PageView"],
            api_secret: "should-not-leak",
          },
        },
      ],
    });

    const container = createSettingsIntegrationContainer();

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/settings/marketing");

      expect(response.status).toBe(200);
      expect(json).toEqual({
        value: {
          pixel_id: "123",
          facebook_pixel_id: "fb-456",
          enabled_events: ["PageView"],
        },
      });
    });
  });

  it("blocks public access to sensitive settings keys", async () => {
    const container = createTestContainer();

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/settings/whatsapp_notifications");

      expect(response.status).toBe(403);
      expect(json).toEqual({
        error: "Access forbidden: sensitive configuration",
      });
    });
  });

  it("caches published pages lookups", async () => {
    db.query = vi.fn().mockResolvedValue({
      rows: [{ id: 1, title: "About", slug: "about", show_in: "header" }],
    });

    const container = createPagesIntegrationContainer();

    await withTestApp(container, async (client) => {
      const first = await client.getJson("/api/pages/published/header");
      const second = await client.getJson("/api/pages/published/header");

      expect(first.response.status).toBe(200);
      expect(second.response.status).toBe(200);
      expect(first.json).toEqual([{ id: 1, title: "About", slug: "about", show_in: "header" }]);
      expect(second.json).toEqual(first.json);
    });

    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it("returns 404 for missing published page slug", async () => {
    db.query = vi.fn().mockResolvedValue({ rows: [] });

    const container = createPagesIntegrationContainer();

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/pages/slug/missing-page");

      expect(response.status).toBe(404);
      expect(json).toEqual({
        error: "Bad Request",
        code: "NOT_FOUND",
        message: "Page not found",
        requestId: expect.any(String),
      });
    });
  });

  it("caches public categories list", async () => {
    db.query = vi.fn().mockResolvedValue({
      rows: [
        { id: 1, name: "Clothes", sort_order: 1 },
        { id: 2, name: "Shoes", sort_order: 2 },
      ],
    });

    const container = createCategoriesIntegrationContainer();

    await withTestApp(container, async (client) => {
      const first = await client.getJson("/api/categories");
      const second = await client.getJson("/api/categories");

      expect(first.response.status).toBe(200);
      expect(second.response.status).toBe(200);
      expect(first.json).toEqual(second.json);
    });

    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it("handles POST /api/orders through security middleware and create order use case", async () => {
    db.query = vi.fn(async (query: string, params?: unknown[]) => {
      if (query.includes("FROM store_settings")) {
        return {
          rows: [{ value: { turnstile_enabled: false, honeypot_enabled: true } }],
        };
      }

      if (query.includes("FROM blacklist")) {
        return { rows: [] };
      }

      if (query.includes("FROM orders")) {
        return { rows: [] };
      }

      if (query === "SELECT NOW()") {
        return { rows: [{ now: new Date().toISOString() }] };
      }

      throw new Error(`Unexpected query in test: ${query} :: ${String(params)}`);
    });

    const createOrderUseCase = {
      execute: vi.fn().mockResolvedValue({
        newOrder: {
          id: "o1",
          order_number: 1001,
          customer_name: "Ahmed",
        },
      }),
    };

    const container = createTestContainer({
      pool: db,
      createOrderUseCase,
    });

    await withTestApp(container, async (client) => {
      const { response, json } = await client.getJson("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cf-connecting-ip": "1.2.3.4",
        },
        body: JSON.stringify({
          customer_name: "Ahmed",
          customer_phone: "0555000000",
          wilaya: "Algiers",
          commune: "Bab Ezzouar",
          address: "Street 1",
          delivery_type: "home",
          subtotal: 1200,
          shipping_cost: 300,
          total: 1500,
          note: "",
          items: [
            {
              product_id: "550e8400-e29b-41d4-a716-446655440000",
              product_name: "Product 1",
              selected_options: { Size: "M" },
              quantity: 1,
              unit_price: 1200,
              total: 1200,
            },
          ],
        }),
      });

      expect(response.status).toBe(201);
      expect(json.id).toBe("o1");
    });

    expect(createOrderUseCase.execute).toHaveBeenCalledWith({
      body: expect.objectContaining({
        customer_name: "Ahmed",
        customer_phone: "0555000000",
      }),
      requestIp: "1.2.3.4",
    });
  });

  it("replays POST /api/orders when the same idempotency key is reused", async () => {
    db.query = vi.fn(async (query: string) => {
      if (query.includes("FROM store_settings")) {
        return {
          rows: [{ value: { turnstile_enabled: false, honeypot_enabled: true } }],
        };
      }

      if (query.includes("FROM blacklist")) {
        return { rows: [] };
      }

      if (query.includes("FROM orders")) {
        return { rows: [] };
      }

      if (query === "SELECT NOW()") {
        return { rows: [{ now: new Date().toISOString() }] };
      }

      throw new Error(`Unexpected query in test: ${query}`);
    });

    const createOrderUseCase = {
      execute: vi.fn().mockResolvedValue({
        newOrder: {
          id: "o2",
          order_number: 1002,
          customer_name: "Ahmed",
        },
      }),
    };

    const container = createTestContainer({
      pool: db,
      createOrderUseCase,
    });

    const payload = {
      customer_name: "Ahmed",
      customer_phone: "0555000000",
      wilaya: "Algiers",
      commune: "Bab Ezzouar",
      address: "Street 1",
      delivery_type: "home",
      subtotal: 1200,
      shipping_cost: 300,
      total: 1500,
      note: "",
      items: [
        {
          product_id: "550e8400-e29b-41d4-a716-446655440000",
          product_name: "Product 1",
          selected_options: { Size: "M" },
          quantity: 1,
          unit_price: 1200,
          total: 1200,
        },
      ],
    };

    await withTestApp(container, async (client) => {
      const first = await client.getJson("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cf-connecting-ip": "1.2.3.4",
          "idempotency-key": "checkout-123",
        },
        body: JSON.stringify(payload),
      });

      const second = await client.getJson("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cf-connecting-ip": "1.2.3.4",
          "idempotency-key": "checkout-123",
        },
        body: JSON.stringify(payload),
      });

      expect(first.response.status).toBe(201);
      expect(second.response.status).toBe(201);
      expect(second.response.headers.get("x-idempotent-replayed")).toBe("true");
      expect(second.json).toEqual(first.json);
    });

    expect(createOrderUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
