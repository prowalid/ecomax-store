import { beforeEach, describe, expect, it } from "vitest";
import getAnalyticsUseCaseModule from "../../../server/src/application/use-cases/analytics/GetAnalytics";

const { GetAnalyticsUseCase } = getAnalyticsUseCaseModule as any;

describe("GetAnalyticsUseCase", () => {
  let analyticsRepository: any;
  let useCase: any;

  beforeEach(() => {
    analyticsRepository = {
      getMetrics: async () => ({
        total_orders: 10,
        new_orders: 2,
        delivered_orders: 4,
        confirmed_pipeline_orders: 6,
        cancelled_orders: 1,
        total_revenue: 5000,
        month_revenue: 3000,
        avg_delivered_order_value: 1250,
        today_orders: 1,
        week_orders: 5,
        month_orders: 9,
      }),
      getProductMetrics: async () => ({
        active_products: 12,
        low_stock_products: 2,
        out_of_stock_products: 1,
      }),
      getCustomerMetrics: async () => ({
        total_customers: 8,
        new_customers_30d: 3,
      }),
      getStatusBreakdown: async () => [
        { status: "new", count: 2 },
        { status: "confirmed", count: 3 },
        { status: "delivered", count: 4 },
      ],
    };

    useCase = new GetAnalyticsUseCase({ analyticsRepository });
  });

  it("builds the analytics response shape", async () => {
    const result = await useCase.execute();

    expect(result.timezone).toBe("Africa/Algiers");
    expect(result.sales.totalRevenue).toBe(5000);
    expect(result.orders.total).toBe(10);
    expect(result.orders.confirmRate).toBe(60);
    expect(result.orders.statusBreakdown.delivered).toBe(4);
    expect(result.products.active).toBe(12);
    expect(result.customers.newLast30Days).toBe(3);
  });
});

