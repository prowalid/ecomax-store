import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  stock: number;
  sku: string | null;
  category_id: string | null;
  image_url: string | null;
  status: ProductStatus;
  variants_count: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await api.get('/products');
      return data as Product[];
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: { name: string; price?: number; stock?: number; status?: ProductStatus; category_id?: string; description?: string; compare_price?: number; cost_price?: number; sku?: string; image_url?: string }) => {
      return await api.post('/products', product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم إضافة المنتج");
    },
    onError: (error: Error) => toast.error(error.message || "فشل إضافة المنتج"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      return await api.patch(`/products/${id}`, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم تحديث المنتج");
    },
    onError: (error: Error) => toast.error(error.message || "فشل تحديث المنتج"),
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
