import { describe, expect, it } from "vitest";
import runtimeModule from "../../../server/src/config/runtime";

const { validateRuntimeEnv, maskSecret } = runtimeModule as any;

describe("runtime config", () => {
  it("accepts a valid production env", () => {
    const result = validateRuntimeEnv({
      NODE_ENV: "production",
      PORT: "3001",
      DB_HOST: "db",
      DB_PORT: "5432",
      DB_NAME: "expresstrade",
      DB_USER: "etk_user",
      DB_PASSWORD: "secret-db",
      JWT_SECRET: "12345678901234567890123456789012",
      CORS_ORIGINS: "https://example.com",
      CACHE_DRIVER: "redis",
      REDIS_HOST: "redis",
      METRICS_ENABLED: "true",
      METRICS_TOKEN: "metrics-secret",
    });

    expect(result.summary.metricsProtected).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("rejects weak jwt secrets in production", () => {
    expect(() =>
      validateRuntimeEnv({
        NODE_ENV: "production",
        PORT: "3001",
        DB_HOST: "db",
        DB_PORT: "5432",
        DB_NAME: "expresstrade",
        DB_USER: "etk_user",
        DB_PASSWORD: "secret-db",
        JWT_SECRET: "short-secret",
        CORS_ORIGINS: "https://example.com",
      })
    ).toThrow(/JWT_SECRET/);
  });

  it("warns when metrics are public in production", () => {
    const result = validateRuntimeEnv({
      NODE_ENV: "production",
      PORT: "3001",
      DB_HOST: "db",
      DB_PORT: "5432",
      DB_NAME: "expresstrade",
      DB_USER: "etk_user",
      DB_PASSWORD: "secret-db",
      JWT_SECRET: "12345678901234567890123456789012",
      CORS_ORIGINS: "https://example.com",
      METRICS_ENABLED: "true",
      METRICS_TOKEN: "",
    });

    expect(result.warnings[0]).toMatch(/METRICS_TOKEN/);
  });

  it("masks secrets safely", () => {
    expect(maskSecret("1234567890abcdef")).toBe("1234***cdef");
  });
});
