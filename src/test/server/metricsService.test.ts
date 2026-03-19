import { describe, expect, it } from "vitest";
import metricsServiceModule from "../../../server/src/infrastructure/services/MetricsService";

const { MetricsService } = metricsServiceModule as any;

describe("MetricsService", () => {
  it("records request counters and histograms", async () => {
    const service = new MetricsService({
      prefix: "test_",
      collectDefaultMetrics: false,
    });

    service.onRequestStart();
    service.onRequestComplete({
      method: "GET",
      baseUrl: "/api/products",
      routePath: "/:id",
      fallbackPath: "/api/products/1",
      statusCode: 200,
      durationSeconds: 0.05,
    });

    const metrics = await service.getMetrics();

    expect(metrics).toContain("test_http_requests_total");
    expect(metrics).toContain('route="/api/products/:id"');
    expect(metrics).toContain("test_http_request_duration_seconds_bucket");
    expect(metrics).toContain("test_http_requests_in_flight 0");
  });

  it("records domain event phases", async () => {
    const service = new MetricsService({
      prefix: "test_",
      collectDefaultMetrics: false,
    });

    service.onDomainEvent("order.created", "published");
    service.onDomainEvent("order.created", "queued");

    const metrics = await service.getMetrics();

    expect(metrics).toContain("test_domain_events_total");
    expect(metrics).toContain('event_name="order.created",phase="published"');
    expect(metrics).toContain('event_name="order.created",phase="queued"');
  });
});
