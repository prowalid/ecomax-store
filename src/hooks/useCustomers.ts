import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  orders_count?: number;
  total_spent?: number;
  last_order_at?: string;
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customer: { name: string; phone: string; wilaya?: string; commune?: string; address?: string; notes?: string }) => {
      // Check if customer with same phone exists
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", customer.phone)
        .maybeSingle();

      if (existing) {
        // Update existing customer with new info
        const { data, error } = await supabase
          .from("customers")
          .update({
            name: customer.name,
            wilaya: customer.wilaya || null,
            commune: customer.commune || null,
            address: customer.address || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      // Create new customer
      const { data, error } = await supabase.from("customers").insert([customer]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    // Silently fail for storefront - admin will see errors
  });
}
