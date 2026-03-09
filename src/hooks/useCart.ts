import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useMemo } from "react";

const SESSION_KEY = "cart_session_id";

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image_url: string | null;
  quantity: number;
  session_id: string;
}

export function useCart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CartItem[];
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (product: {
      product_id: string;
      product_name: string;
      product_price: number;
      product_image_url?: string | null;
      quantity?: number;
    }) => {
      // Check if item already exists
      const existing = items.find((i) => i.product_id === product.product_id);
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + (product.quantity || 1) })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert([
          {
            session_id: sessionId,
            product_id: product.product_id,
            product_name: product.product_name,
            product_price: product.product_price,
            product_image_url: product.product_image_url || null,
            quantity: product.quantity || 1,
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cart_items").delete().eq("session_id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const addItem = useCallback(
    (product: {
      product_id: string;
      product_name: string;
      product_price: number;
      product_image_url?: string | null;
      quantity?: number;
    }) => addItemMutation.mutate(product),
    [addItemMutation]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => updateQuantityMutation.mutate({ itemId, quantity }),
    [updateQuantityMutation]
  );

  const removeItem = useCallback(
    (itemId: string) => removeItemMutation.mutate(itemId),
    [removeItemMutation]
  );

  const clearCart = useCallback(() => clearCartMutation.mutate(), [clearCartMutation]);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product_price * i.quantity, 0),
    [items]
  );

  return {
    items,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalCount,
    totalPrice,
    sessionId,
    isAdding: addItemMutation.isPending,
  };
}
