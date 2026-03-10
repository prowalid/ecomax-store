import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  apply_to: "all" | "specific";
  product_ids: string[];
  quantity_behavior: "all" | "single" | "min_quantity";
  min_quantity: number;
}

export function useDiscounts() {
  return useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const data = await api.get('/discounts');
      return data as Discount[];
    },
  });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      code: string;
      type: string;
      value: number;
      usage_limit?: number | null;
      active?: boolean;
      expires_at?: string | null;
      apply_to?: "all" | "specific";
      product_ids?: string[];
      quantity_behavior?: "all" | "single" | "min_quantity";
      min_quantity?: number;
    }) => {
      return await api.post('/discounts', input);
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
      return await api.patch(`/discounts/${id}`, updates);
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
      return await api.delete(`/discounts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("تم حذف الخصم");
    },
    onError: () => toast.error("فشل حذف الخصم"),
  });
}
