import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  sort_order: number;
  image_url: string | null;
  version: number;
  created_at: string;
  products_count?: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await api.get('/categories');
      return data as Category[];
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; slug?: string; sort_order?: number; image_url?: string }) => {
      return await api.post('/categories', cat);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("تم إضافة التصنيف");
    },
    onError: (error: Error) => toast.error(error.message || "فشل إضافة التصنيف"),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      return await api.patch(`/categories/${id}`, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("تم تحديث التصنيف");
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === "CONFLICT") {
        qc.invalidateQueries({ queryKey: ["categories"] });
      }
      toast.error(error.message || "فشل تحديث التصنيف");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("تم حذف التصنيف");
    },
    onError: (error: Error) => toast.error(error.message || "فشل حذف التصنيف"),
  });
}
