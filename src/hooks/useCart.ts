import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
      const data = await api.get(`/cart/${sessionId}`);
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
      await api.post('/cart', {
        ...product,
        session_id: sessionId
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await api.patch(`/cart/${itemId}`, { quantity });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/cart/${itemId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/cart/session/${sessionId}`);
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
