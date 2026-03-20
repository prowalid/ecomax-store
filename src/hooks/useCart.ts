import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCallback, useMemo } from "react";
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from "@/lib/safeStorage";
import { normalizeSelectedOptions, type SelectedProductOptions } from "@/lib/productOptions";

const SESSION_KEY = "cart_session_id";

function generateSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  let sessionId = safeGetLocalStorageItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    safeSetLocalStorageItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  selected_options: SelectedProductOptions;
  product_price: number;
  product_image_url: string | null;
  quantity: number;
  session_id: string;
}

const buildCartItemSignature = (item: Pick<CartItem, "product_id" | "selected_options">) =>
  `${item.product_id}::${JSON.stringify(normalizeSelectedOptions(item.selected_options))}`;

export function useCart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => {
      const data = await api.get(`/cart/${sessionId}`);
      return (data as CartItem[]).map((item) => ({
        ...item,
        selected_options: normalizeSelectedOptions(item.selected_options),
        product_price: Number(item.product_price),
        quantity: Number(item.quantity),
      }));
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (product: {
      product_id: string;
      product_name: string;
      selected_options?: SelectedProductOptions;
      product_price: number;
      product_image_url?: string | null;
      quantity?: number;
    }) => {
      await api.post('/cart', {
        ...product,
        session_id: sessionId
      });
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: ["cart", sessionId] });

      const previousItems = queryClient.getQueryData<CartItem[]>(["cart", sessionId]) || [];
      const normalizedOptions = normalizeSelectedOptions(product.selected_options);
      const optimisticSignature = buildCartItemSignature({
        product_id: product.product_id,
        selected_options: normalizedOptions,
      });

      const existingIndex = previousItems.findIndex(
        (item) => buildCartItemSignature(item) === optimisticSignature
      );

      const nextItems = [...previousItems];

      if (existingIndex >= 0) {
        const existingItem = nextItems[existingIndex];
        nextItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + (product.quantity ?? 1),
        };
      } else {
        nextItems.unshift({
          id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          product_id: product.product_id,
          product_name: product.product_name,
          selected_options: normalizedOptions,
          product_price: Number(product.product_price),
          product_image_url: product.product_image_url ?? null,
          quantity: product.quantity ?? 1,
          session_id: sessionId,
        });
      }

      queryClient.setQueryData(["cart", sessionId], nextItems);

      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["cart", sessionId], context.previousItems);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await api.patch(`/cart/${itemId}`, { quantity, session_id: sessionId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/cart/${itemId}?session_id=${encodeURIComponent(sessionId)}`);
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
      selected_options?: SelectedProductOptions;
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

  const removeItemAsync = useCallback(
    (itemId: string) => removeItemMutation.mutateAsync(itemId),
    [removeItemMutation]
  );

  const clearCart = useCallback(() => clearCartMutation.mutate(), [clearCartMutation]);
  const clearCartAsync = useCallback(() => clearCartMutation.mutateAsync(), [clearCartMutation]);

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
    removeItemAsync,
    clearCart,
    clearCartAsync,
    totalCount,
    totalPrice,
    sessionId,
    isAdding: addItemMutation.isPending,
  };
}
