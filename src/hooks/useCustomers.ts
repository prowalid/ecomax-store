import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  orders_count?: number;
  total_spent?: number;
  last_order_at?: string;
}

export interface CustomersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCustomersResponse {
  items: Customer[];
  pagination: CustomersPagination;
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const data = await api.get('/customers');
      return data as Customer[];
    },
  });
}

export function usePaginatedCustomers(
  filters: { search?: string } = {},
  options: { page?: number; limit?: number } = {},
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return useQuery({
    queryKey: ["customers", "paginated", filters.search?.trim() || "", page, limit],
    queryFn: async () => {
      const data = await api.get(`/customers?${params.toString()}`);
      return data as PaginatedCustomersResponse;
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customer: { name: string; phone: string; wilaya?: string; commune?: string; address?: string; notes?: string }) => {
      // The backend custom API now handles the "check if exists by phone -> insert or update" logic
      return await api.post('/customers', customer);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    // Silently fail for storefront - admin will see errors
  });
}
