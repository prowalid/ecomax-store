import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AnalyticsStatusBreakdown {
  new: number;
  attempt: number;
  no_answer: number;
  confirmed: number;
  cancelled: number;
  ready: number;
  shipped: number;
  delivered: number;
  returned: number;
}

export interface AdminAnalytics {
  timezone: string;
  sales: {
    totalRevenue: number;
    monthRevenue: number;
    avgDeliveredOrderValue: number;
  };
  orders: {
    total: number;
    new: number;
    delivered: number;
    confirmedPipeline: number;
    cancelled: number;
    today: number;
    week: number;
    month: number;
    confirmRate: number;
    cancelRate: number;
    statusBreakdown: AnalyticsStatusBreakdown;
  };
  products: {
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    newLast30Days: number;
  };
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const data = await api.get("/analytics");
      return data as AdminAnalytics;
    },
  });
}
