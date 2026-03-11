import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Message templates
const TEMPLATES: Record<string, (data: Record<string, unknown>) => string> = {
  order_confirmed: (d) =>
    `✅ *تأكيد الطلب #${d.order_id}*\n\nمرحباً ${d.customer_name}،\nتم تأكيد طلبك بنجاح.\n\n📦 المنتجات: ${d.items || "—"}\n💰 المبلغ: ${d.total || "—"} د.ج\n\nشكراً لثقتك بنا! 🙏`,

  order_shipped: (d) =>
    `🚚 *طلبك #${d.order_id} في الطريق!*\n\nمرحباً ${d.customer_name}،\nتم شحن طلبك.\n\n${d.tracking_number ? `📋 رقم التتبع: ${d.tracking_number}` : ""}${d.shipping_company ? `\n🏢 شركة الشحن: ${d.shipping_company}` : ""}\n\nسيصلك قريباً إن شاء الله!`,

  order_delivered: (d) =>
    `🎉 *تم تسليم طلبك #${d.order_id}*\n\nمرحباً ${d.customer_name}،\nتم تسليم طلبك بنجاح.\n\nنتمنى أن ينال المنتج إعجابك! ⭐\nلا تتردد في التواصل معنا لأي استفسار.`,

  new_order_admin: (d) =>
    `🔔 *طلب جديد #${d.order_id}*\n\n👤 الزبون: ${d.customer_name}\n📞 الهاتف: ${d.customer_phone}\n📍 العنوان: ${d.address || "—"}\n🏙️ الولاية: ${d.state || "—"}\n\n📦 المنتجات: ${d.items || "—"}\n💰 المبلغ: ${d.total || "—"} د.ج`,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const INSTANCE_ID = Deno.env.get("GREEN_API_INSTANCE_ID");
    const API_TOKEN = Deno.env.get("GREEN_API_TOKEN");

    if (!INSTANCE_ID || !API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing GREEN_API_INSTANCE_ID or GREEN_API_TOKEN secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { template, phone, data } = body;

    if (!template || !phone) {
      return new Response(
        JSON.stringify({ error: "template and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message from template or use custom message
    let message: string;
    if (template === "custom") {
      message = data?.message || "";
    } else {
      const templateFn = TEMPLATES[template];
      if (!templateFn) {
        return new Response(
          JSON.stringify({ error: `Unknown template: ${template}`, available: Object.keys(TEMPLATES) }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      message = templateFn(data || {});
    }

    // Normalize phone: ensure it starts with country code, no +
    let chatId = phone.replace(/[\s\-+()]/g, "");
    if (chatId.startsWith("0")) {
      chatId = "213" + chatId.substring(1); // Algeria country code
    }
    if (!chatId.includes("@")) {
      chatId = chatId + "@c.us";
    }

    // Send via Green API
    const greenApiUrl = `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`;

    const greenResponse = await fetch(greenApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    });

    const greenResult = await greenResponse.json();

    if (!greenResponse.ok || greenResult.error) {
      console.error("[WhatsApp] Green API error:", JSON.stringify(greenResult));
      return new Response(
        JSON.stringify({ success: false, error: greenResult.message || "Green API error", details: greenResult }),
        { status: greenResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WhatsApp] Message sent to ${chatId} — template: ${template}, idMessage: ${greenResult.idMessage}`);

    return new Response(
      JSON.stringify({ success: true, idMessage: greenResult.idMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[WhatsApp] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
