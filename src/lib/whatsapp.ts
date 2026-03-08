import { supabase } from "@/integrations/supabase/client";

export type WhatsAppTemplate =
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "new_order_admin"
  | "custom";

export interface SendWhatsAppParams {
  template: WhatsAppTemplate;
  phone: string;
  data?: Record<string, any>;
}

export async function sendWhatsAppNotification(params: SendWhatsAppParams) {
  const { data, error } = await supabase.functions.invoke("whatsapp-notify", {
    body: params,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.error || "فشل إرسال الرسالة");
  }

  return data;
}

/**
 * Get notification settings from store_settings table
 */
export async function getNotificationSettings() {
  const { data, error } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "whatsapp_notifications")
    .single();

  if (error || !data) return null;
  return data.value as {
    enabled_notifications: Record<string, boolean>;
    admin_phone: string;
    api_configured: boolean;
  };
}

/**
 * Send WhatsApp notification based on order status change.
 * Checks if the notification type is enabled before sending.
 */
export async function sendOrderStatusNotification(
  orderId: string,
  newStatus: string,
  orderData: {
    customer_name: string;
    customer_phone: string;
    items?: string;
    total?: string;
    address?: string;
    state?: string;
    tracking_number?: string;
    shipping_company?: string;
  }
) {
  const settings = await getNotificationSettings();
  if (!settings || !settings.api_configured) return;

  const statusToTemplate: Record<string, WhatsAppTemplate> = {
    confirmed: "order_confirmed",
    shipped: "order_shipped",
    delivered: "order_delivered",
  };

  const template = statusToTemplate[newStatus];

  // Send customer notification
  if (template && settings.enabled_notifications[template]) {
    try {
      await sendWhatsAppNotification({
        template,
        phone: orderData.customer_phone,
        data: { order_id: orderId, ...orderData },
      });
    } catch (err) {
      console.error(`[WhatsApp] Failed to send ${template} to customer:`, err);
    }
  }

  // Send admin notification for new orders
  if (newStatus === "new" && settings.enabled_notifications.new_order_admin && settings.admin_phone) {
    try {
      await sendWhatsAppNotification({
        template: "new_order_admin",
        phone: settings.admin_phone,
        data: { order_id: orderId, ...orderData },
      });
    } catch (err) {
      console.error("[WhatsApp] Failed to send new_order_admin:", err);
    }
  }
}
