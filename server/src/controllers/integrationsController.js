const crypto = require('crypto');
const pool = require('../config/db');

// SHA-256 hash helper (lowercase hex)
function sha256(value) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Normalize phone: remove spaces, dashes, +; ensure digits only
function normalizePhone(phone) {
  return phone.replace(/[\s\-\+\(\)]/g, "");
}

// POST /api/integrations/facebook-capi
async function facebookCapi(req, res, next) {
  try {
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key = 'marketing_settings' LIMIT 1");
    const settings = rows.length > 0 ? rows[0].value : {};

    const PIXEL_ID = settings.pixel_id || process.env.FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = settings.capi_token || process.env.FACEBOOK_ACCESS_TOKEN;
    const TEST_EVENT_CODE = process.env.FACEBOOK_TEST_EVENT_CODE;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return res.status(500).json({ error: "الرجاء إعداد بيانات Facebook CAPI في صفحة التسويق أولاً." });
    }

    const { event_name, event_id, event_time, event_source_url, user_data = {}, custom_data } = req.body;

    if (!event_name || !event_id) {
      return res.status(400).json({ error: "event_name and event_id are required" });
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null;

    const hashedUserData = {};

    if (user_data.ph) hashedUserData.ph = [sha256(normalizePhone(user_data.ph))];
    if (user_data.fn) hashedUserData.fn = [sha256(user_data.fn)];
    if (user_data.ln) hashedUserData.ln = [sha256(user_data.ln)];
    if (user_data.ct) hashedUserData.ct = [sha256(user_data.ct)];
    if (user_data.st) hashedUserData.st = [sha256(user_data.st)];
    if (user_data.em) hashedUserData.em = [sha256(user_data.em)];

    if (clientIp) hashedUserData.client_ip_address = clientIp;
    if (user_data.client_user_agent) hashedUserData.client_user_agent = user_data.client_user_agent;
    if (user_data.fbp) hashedUserData.fbp = user_data.fbp;
    if (user_data.fbc) hashedUserData.fbc = user_data.fbc;

    const eventPayload = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: "website",
      user_data: hashedUserData,
    };

    if (custom_data && Object.keys(custom_data).length > 0) {
      eventPayload.custom_data = custom_data;
    }

    const fbPayload = { data: [eventPayload] };
    if (TEST_EVENT_CODE) fbPayload.test_event_code = TEST_EVENT_CODE;

    const fbUrl = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const fbResponse = await fetch(fbUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbPayload),
    });

    const fbResult = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error("[CAPI] Facebook API error:", fbResult);
      return res.status(fbResponse.status).json({
        success: false,
        error: fbResult.error?.message || "Facebook API error",
        details: fbResult,
      });
    }

    res.json({ success: true, events_received: fbResult.events_received, messages: fbResult.messages || [] });
  } catch (err) {
    next(err);
  }
}

const TEMPLATES = {
  order_confirmed: (d) =>
    `✅ *تأكيد الطلب #${d.order_id}*\n\nمرحباً ${d.customer_name}،\nتم تأكيد طلبك بنجاح.\n\n📦 المنتجات: ${d.items || "—"}\n💰 المبلغ: ${d.total || "—"} د.ج\n\nشكراً لثقتك بنا! 🙏`,

  order_shipped: (d) =>
    `🚚 *طلبك #${d.order_id} في الطريق!*\n\nمرحباً ${d.customer_name}،\nتم شحن طلبك.\n\n${d.tracking_number ? `📋 رقم التتبع: ${d.tracking_number}` : ""}${d.shipping_company ? `\n🏢 شركة الشحن: ${d.shipping_company}` : ""}\n\nسيصلك قريباً إن شاء الله!`,

  order_delivered: (d) =>
    `🎉 *تم تسليم طلبك #${d.order_id}*\n\nمرحباً ${d.customer_name}،\nتم تسليم طلبك بنجاح.\n\nنتمنى أن ينال المنتج إعجابك! ⭐\nلا تتردد في التواصل معنا لأي استفسار.`,

  new_order_admin: (d) =>
    `🔔 *طلب جديد #${d.order_id}*\n\n👤 الزبون: ${d.customer_name}\n📞 الهاتف: ${d.customer_phone}\n📍 العنوان: ${d.address || "—"}\n🏙️ الولاية: ${d.state || "—"}\n\n📦 المنتجات: ${d.items || "—"}\n💰 المبلغ: ${d.total || "—"} د.ج`,
};

// Internal Server helper for WhatsApp API
async function sendWhatsAppInternal({ template, phone, data }) {
  try {
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key = 'whatsapp_notifications' LIMIT 1");
    const settings = rows.length > 0 ? rows[0].value : {};
    
    if (!settings.api_configured) return;
    
    const INSTANCE_ID = settings.instance_id || process.env.GREEN_API_INSTANCE_ID;
    const API_TOKEN = settings.api_token || process.env.GREEN_API_TOKEN;

    if (!INSTANCE_ID || !API_TOKEN) return;

    if (!template || !phone) return;

    let message;
    if (template === "custom") {
      message = data?.message || "";
    } else {
      const templateFn = TEMPLATES[template];
      if (!templateFn) return;
      message = templateFn(data || {});
    }

    let chatId = phone.replace(/[\s\-\+\(\)]/g, "");
    if (chatId.startsWith("0")) chatId = "213" + chatId.substring(1);
    if (!chatId.includes("@")) chatId = chatId + "@c.us";

    const greenApiUrl = `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`;
    const greenResponse = await fetch(greenApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    });

    if (!greenResponse.ok) {
      console.error("[WhatsApp] Green API error:", await greenResponse.text());
    }
  } catch (err) {
    console.error("[WhatsApp] Exception:", err);
  }
}

// Internal orchestrator replacing the frontend logic
async function triggerOrderStatusNotification(orderId, newStatus, orderData) {
  try {
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key = 'whatsapp_notifications' LIMIT 1");
    const settings = rows.length > 0 ? rows[0].value : {};
    
    if (!settings || !settings.api_configured) return;

    const statusToTemplate = {
      confirmed: "order_confirmed",
      shipped: "order_shipped",
      delivered: "order_delivered",
    };

    const template = statusToTemplate[newStatus];

    // Customer notification
    if (template && settings.enabled_notifications && settings.enabled_notifications[template]) {
      sendWhatsAppInternal({
        template,
        phone: orderData.customer_phone,
        data: { order_id: orderId, ...orderData },
      });
    }

    // Admin notification
    if (newStatus === "new" && settings.enabled_notifications && settings.enabled_notifications.new_order_admin && settings.admin_phone) {
      sendWhatsAppInternal({
        template: "new_order_admin",
        phone: settings.admin_phone,
        data: { order_id: orderId, ...orderData },
      });
    }
  } catch (err) {
    console.error("[WhatsApp] Auto-trigger error:", err);
  }
}

// POST /api/integrations/update-green-api
async function updateGreenApi(req, res, next) {
  try {
    const { instance_id, api_token } = req.body;

    if (!instance_id || !api_token) {
      return res.status(400).json({ error: "instance_id and api_token are required" });
    }

    const checkUrl = `https://api.green-api.com/waInstance${instance_id}/getStateInstance/${api_token}`;
    const checkRes = await fetch(checkUrl);
    const checkData = await checkRes.json();

    if (!checkRes.ok || checkData.stateInstance === undefined) {
      return res.status(400).json({ success: false, error: "بيانات Green API غير صالحة", details: checkData });
    }

    // Update api_configured to true in database
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key = 'whatsapp_notifications' LIMIT 1");
    const currentValue = rows.length > 0 ? rows[0].value : {};
    const updatedValue = { ...currentValue, api_configured: true, instance_id, api_token };

    await pool.query(
      "INSERT INTO store_settings (key, value, updated_at) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3",
      ['whatsapp_notifications', updatedValue, new Date().toISOString()]
    );

    res.json({ success: true, state: checkData.stateInstance, message: "تم التحقق من بيانات Green API بنجاح" });
  } catch (err) {
    next(err);
  }
}

module.exports = { facebookCapi, updateGreenApi, triggerOrderStatusNotification };
