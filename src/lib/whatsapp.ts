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
