import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendOrderStatusNotification } from "@/lib/whatsapp";

export type OrderStatus = "new" | "attempt" | "no_answer" | "confirmed" | "cancelled" | "ready" | "shipped" | "delivered" | "returned";
export type DeliveryType = "home" | "desk";

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  delivery_type: DeliveryType;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_number: string | null;
  shipping_company: string | null;
  note: string | null;
  call_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ["order_items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId!);
      if (error) throw error;
      return data as OrderItem[];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, order }: { id: string; status: OrderStatus; order: Order }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "attempt") {
        updates.call_attempts = (order.call_attempts || 0) + 1;
      }
      const { error } = await supabase.from("orders").update(updates).eq("id", id);
      if (error) throw error;

      // Send WhatsApp notification in background
      sendOrderStatusNotification(
        `#${order.order_number}`,
        status,
        {
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          items: "", // Will be filled from order_items if needed
          total: String(order.total),
          address: order.address || "",
          state: order.wilaya || "",
          tracking_number: order.tracking_number || "",
          shipping_company: order.shipping_company || "",
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("فشل تحديث حالة الطلب"),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: { customer_name: string; customer_phone: string; total?: number; wilaya?: string; commune?: string; address?: string; delivery_type?: DeliveryType; subtotal?: number; shipping_cost?: number; note?: string | null; customer_id?: string; discount_code?: string; discount_amount?: number; items?: { product_name: string; quantity: number; unit_price: number; total: number; product_id?: string }[] }) => {
      const { items, ...orderData } = order;
      const { data, error } = await supabase.from("orders").insert([orderData]).select().single();
      if (error) throw error;

      if (items && items.length > 0) {
        const orderItems = items.map((item) => ({
          ...item,
          order_id: data.id,
        }));
        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) console.error("Failed to insert order items:", itemsError);
      }

      // Send admin notification
      sendOrderStatusNotification(
        `#${data.order_number}`,
        "new",
        {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          total: String(data.total),
          address: data.address || "",
          state: data.wilaya || "",
        }
      );

      // Send webhook notification in background
      try {
        const { data: settingsData } = await supabase
          .from("store_settings")
          .select("value")
          .eq("key", "marketing")
          .maybeSingle();
        const webhookUrl = (settingsData?.value as any)?.webhook_url;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "new_order",
              order: {
                id: data.id,
                order_number: data.order_number,
                customer_name: data.customer_name,
                customer_phone: data.customer_phone,
                wilaya: data.wilaya,
                commune: data.commune,
                address: data.address,
                delivery_type: data.delivery_type,
                subtotal: data.subtotal,
                shipping_cost: data.shipping_cost,
                discount_code: data.discount_code,
                discount_amount: data.discount_amount,
                total: data.total,
                note: data.note,
                status: data.status,
                created_at: data.created_at,
              },
              items: items || [],
            }),
          }).catch((err) => console.error("Webhook failed:", err));
        }
      } catch (err) {
        console.error("Webhook settings fetch failed:", err);
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("تم إنشاء الطلب");
    },
    onError: () => toast.error("فشل إنشاء الطلب"),
  });
}
