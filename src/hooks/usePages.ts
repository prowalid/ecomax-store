import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PageShowIn = "header" | "footer" | "both" | "none";

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  show_in: PageShowIn;
  created_at: string;
  updated_at: string;
}

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Page[];
    },
  });
}

/** Published pages filtered by placement */
export function usePublishedPages(placement: "header" | "footer") {
  return useQuery({
    queryKey: ["pages", "published", placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug, show_in")
        .eq("published", true)
        .in("show_in", [placement, "both"])
        .order("created_at", { ascending: true });
      if (error) throw error;
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
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as Page | null;
    },
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; content?: string; published?: boolean; show_in?: PageShowIn }) => {
      const { data, error } = await supabase.from("pages").insert([page]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      toast.success("تم إنشاء الصفحة");
    },
    onError: () => toast.error("فشل إنشاء الصفحة"),
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Page> & { id: string }) => {
      const { error } = await supabase.from("pages").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      toast.success("تم تحديث الصفحة");
    },
    onError: () => toast.error("فشل تحديث الصفحة"),
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      toast.success("تم حذف الصفحة");
    },
    onError: () => toast.error("فشل حذف الصفحة"),
  });
}
