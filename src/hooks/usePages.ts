import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type PageShowIn = "header" | "footer" | "both" | "none";

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  show_in: PageShowIn;
  version: number;
  created_at: string;
  updated_at: string;
}

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const data = await api.get('/pages');
      return data as Page[];
    },
  });
}

/** Published pages filtered by placement */
export function usePublishedPages(placement: "header" | "footer") {
  return useQuery({
    queryKey: ["pages", "published", placement],
    queryFn: async () => {
      const data = await api.get(`/pages/published/${placement}`);
      return data as Pick<Page, "id" | "title" | "slug" | "show_in">[];
    },
  });
}

/** Get a single published page by slug */
export function usePageBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["pages", "slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      return await api.get(`/pages/slug/${slug}`) as Page;
    },
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; content?: string; published?: boolean; show_in?: PageShowIn; suppressToast?: boolean }) => {
      const { suppressToast: _suppressToast, ...payload } = page;
      return await api.post('/pages', payload);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      if (!variables.suppressToast) {
        toast.success("تم إنشاء الصفحة");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل إنشاء الصفحة");
      }
    },
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Page> & { id: string; suppressToast?: boolean }) => {
      const { suppressToast: _suppressToast, ...payload } = updates;
      return await api.patch(`/pages/${id}`, payload);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      if (!variables.suppressToast) {
        toast.success("تم تحديث الصفحة");
      }
    },
    onError: (error: Error & { code?: string }, variables) => {
      if (error.code === "CONFLICT") {
        qc.invalidateQueries({ queryKey: ["pages"] });
      }
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل تحديث الصفحة");
      }
    },
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; suppressToast?: boolean }) => {
      return await api.delete(`/pages/${id}`);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      if (!variables.suppressToast) {
        toast.success("تم حذف الصفحة");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل حذف الصفحة");
      }
    },
  });
}
