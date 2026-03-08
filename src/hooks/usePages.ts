import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
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

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; content?: string; published?: boolean }) => {
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
