import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type OrderStatus = "new" | "attempt" | "no_answer" | "confirmed" | "cancelled" | "ready" | "shipped" | "delivered" | "returned";
export type DeliveryType = "home" | "desk";

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  delivery_type: DeliveryType;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_number: string | null;
  shipping_label_url: string | null;
  shipping_company: string | null;
  note: string | null;
  call_attempts: number;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  selected_options: Record<string, string>;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedOrdersResponse {
  items: Order[];
  pagination: OrdersPagination;
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await api.get('/orders');
      return data as Order[];
    },
  });
}

export function usePaginatedOrders(
  filters: { search?: string; status?: OrderStatus | "all" } = {},
  options: { page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams();
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return useQuery({
    queryKey: ["orders", "paginated", filters.search?.trim() || "", filters.status || "all", page, limit],
    queryFn: async () => {
      const data = await api.get(`/orders?${params.toString()}`);
      return data as PaginatedOrdersResponse;
    },
  });
}

export function useOrderItems(orderId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["order_items", orderId],
    enabled: !!orderId && enabled,
    queryFn: async () => {
      const data = await api.get(`/orders/${orderId}/items`);
      return data as OrderItem[];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, order }: { id: string; status: OrderStatus; order: Order }) => {
      // The backend now handles call_attempts incrementing and stock restoration logic inside a safe PG transaction
      await api.patch(`/orders/${id}/status`, { status, call_attempts: order.call_attempts });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message || "فشل تحديث حالة الطلب"),
  });
}

export function useCreateShippingShipment(providerLabel: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => api.post(`/orders/${orderId}/shipping/provider`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`تم رفع الطلب إلى ${providerLabel}`);
    },
    onError: (error: Error) => toast.error(error.message || `فشل رفع الطلب إلى ${providerLabel}`),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: { customer_name: string; customer_phone: string; total?: number; wilaya?: string; commune?: string; address?: string; delivery_type?: DeliveryType; subtotal?: number; shipping_cost?: number; note?: string | null; customer_id?: string; website_url?: string; "cf-turnstile-response"?: string | null; items?: { product_name: string; quantity: number; unit_price: number; total: number; product_id?: string; selected_options?: Record<string, string> }[] }) => {
      
      // The backend now handles the entire transaction (inserting order, items, and updating stock) in one go
      const data = await api.post('/orders', order);

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم إنشاء الطلب");
    },
    onError: (error: Error) => toast.error(error.message || "فشل إنشاء الطلب"),
  });
}
