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
    mutationFn: async (cat: { name: string; slug?: string; sort_order?: number; image_url?: string; suppressToast?: boolean }) => {
      const { suppressToast: _suppressToast, ...payload } = cat;
      return await api.post('/categories', payload);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      if (!variables.suppressToast) {
        toast.success("تم إضافة التصنيف");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل إضافة التصنيف");
      }
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string; suppressToast?: boolean }) => {
      const { suppressToast: _suppressToast, ...payload } = updates;
      return await api.patch(`/categories/${id}`, payload);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      if (!variables.suppressToast) {
        toast.success("تم تحديث التصنيف");
      }
    },
    onError: (error: Error & { code?: string }, variables) => {
      if (error.code === "CONFLICT") {
        qc.invalidateQueries({ queryKey: ["categories"] });
      }
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل تحديث التصنيف");
      }
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; suppressToast?: boolean }) => {
      return await api.delete(`/categories/${id}`);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      if (!variables.suppressToast) {
        toast.success("تم حذف التصنيف");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل حذف التصنيف");
      }
    },
  });
}
