import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usage_count: number;
  usage_limit: number | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useDiscounts() {
  return useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Discount[];
    },
  });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { code: string; type: string; value: number; usage_limit?: number | null; active?: boolean; expires_at?: string | null }) => {
      const discount: Record<string, unknown> = {
        code: input.code,
        type: input.type,
        value: input.value,
      };
      if (input.usage_limit !== undefined && input.usage_limit !== null) {
        discount.usage_limit = input.usage_limit;
      }
      if (input.expires_at !== undefined && input.expires_at !== null) {
        discount.expires_at = input.expires_at;
      }
      if (input.active !== undefined) {
        discount.active = input.active;
      }
      const { data, error } = await supabase.from("discounts").insert([discount]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("تم إنشاء الخصم");
    },
    onError: (err) => {
      console.error("Create discount error:", err);
      toast.error("فشل إنشاء الخصم");
    },
  });
}

export function useUpdateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Discount> & { id: string }) => {
      const { error } = await supabase.from("discounts").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("تم تحديث الخصم");
    },
    onError: () => toast.error("فشل تحديث الخصم"),
  });
}

export function useDeleteDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("discounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("تم حذف الخصم");
    },
    onError: () => toast.error("فشل حذف الخصم"),
  });
}
