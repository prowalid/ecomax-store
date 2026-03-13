import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { normalizeProductOptions, type ProductOptionGroup } from "@/lib/productOptions";

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
  custom_options: ProductOptionGroup[];
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
      return (data as Product[]).map((product) => ({
        ...product,
        custom_options: normalizeProductOptions(product.custom_options),
      }));
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: { name: string; price?: number; stock?: number; status?: ProductStatus; category_id?: string; description?: string; compare_price?: number; cost_price?: number; sku?: string; image_url?: string; custom_options?: ProductOptionGroup[] }) => {
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
