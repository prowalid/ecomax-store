import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { normalizeProductOptions, type ProductOptionGroup } from "@/lib/productOptions";

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  stock: number;
  sku: string | null;
  category_id: string | null;
  image_url: string | null;
  custom_options: ProductOptionGroup[];
  status: ProductStatus;
  version: number;
  variants_count: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc" | "discount_desc";

interface ProductFilters {
  search?: string;
  categoryId?: string | null;
  sort?: ProductSort;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  status?: ProductStatus | "all";
}

export interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProductsResponse {
  items: Product[];
  pagination: ProductsPagination;
}

function buildProductsEndpoint(filters: ProductFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.categoryId) {
    params.set("category_id", filters.categoryId);
  }

  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  if (filters.inStockOnly) {
    params.set("in_stock", "1");
  }

  if (filters.onSaleOnly) {
    params.set("on_sale", "1");
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function buildPaginatedProductsEndpoint(filters: ProductFilters = {}, page = 1, limit = 20) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.categoryId) {
    params.set("category_id", filters.categoryId);
  }

  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  if (filters.inStockOnly) {
    params.set("in_stock", "1");
  }

  if (filters.onSaleOnly) {
    params.set("on_sale", "1");
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return `/products?${params.toString()}`;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters.search?.trim() || "", filters.categoryId || "", filters.sort || "newest", filters.inStockOnly ? "1" : "0", filters.onSaleOnly ? "1" : "0"],
    queryFn: async () => {
      const data = await api.get(buildProductsEndpoint(filters));
      return (data as Product[]).map((product) => ({
        ...product,
        custom_options: normalizeProductOptions(product.custom_options),
      }));
    },
  });
}

export function usePaginatedProducts(
  filters: ProductFilters = {},
  options: { page?: number; limit?: number } = {},
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;

  return useQuery({
    queryKey: [
      "products",
      "paginated",
      filters.search?.trim() || "",
      filters.categoryId || "",
      filters.sort || "newest",
      filters.inStockOnly ? "1" : "0",
      filters.onSaleOnly ? "1" : "0",
      filters.status || "all",
      page,
      limit,
    ],
    queryFn: async () => {
      const data = await api.get(buildPaginatedProductsEndpoint(filters, page, limit));
      const response = data as PaginatedProductsResponse;
      return {
        items: response.items.map((product) => ({
          ...product,
          custom_options: normalizeProductOptions(product.custom_options),
        })),
        pagination: response.pagination,
      };
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: { name: string; price?: number; stock?: number; status?: ProductStatus; category_id?: string; description?: string; compare_price?: number; cost_price?: number; sku?: string; image_url?: string; custom_options?: ProductOptionGroup[]; suppressToast?: boolean }) => {
      const { suppressToast: _suppressToast, ...payload } = product;
      return await api.post('/products', payload);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      if (!variables.suppressToast) {
        toast.success("تم إضافة المنتج");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل إضافة المنتج");
      }
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string; suppressToast?: boolean }) => {
      const { suppressToast: _suppressToast, ...payload } = updates;
      return await api.patch(`/products/${id}`, payload);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      if (!variables.suppressToast) {
        toast.success("تم تحديث المنتج");
      }
    },
    onError: (error: Error & { code?: string }, variables) => {
      if (error.code === "CONFLICT") {
        qc.invalidateQueries({ queryKey: ["products"] });
      }
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل تحديث المنتج");
      }
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم حذف المنتج");
    },
    onError: (error: Error) => toast.error(error.message || "فشل حذف المنتج"),
  });
}
