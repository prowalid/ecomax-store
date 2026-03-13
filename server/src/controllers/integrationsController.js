const crypto = require('crypto');
const pool = require('../config/db');
const logger = require('../utils/logger');

async function getMarketingSettings() {
  const { rows } = await pool.query(
    "SELECT key, value FROM store_settings WHERE key = ANY($1) ORDER BY CASE WHEN key = 'marketing_settings' THEN 0 ELSE 1 END",
    [['marketing', 'marketing_settings']]
  );

  return rows.reduce((acc, row) => ({ ...acc, ...(row.value || {}) }), {});
}

// SHA-256 hash helper (lowercase hex)
function sha256(value) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Normalize phone: remove spaces, dashes, +; ensure digits only
function normalizePhone(phone) {
  return phone.replace(/[\s\-\+\(\)]/g, "");
}

function createWebhookSignature(secret, rawBody) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

function sanitizeWebhookUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

async function sendOrderWebhook(eventType, payload) {
  try {
    const settings = await getMarketingSettings();
    const webhookUrl = sanitizeWebhookUrl(settings.webhook_url);

    if (!webhookUrl) {
      return { success: false, skipped: true, reason: 'webhook_url_not_configured' };
    }

    const webhookSecret = String(settings.webhook_secret || '').trim();
    const body = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'ExpressTradeKit-Webhook/1.0',
      'X-ETK-Event': eventType,
      'X-ETK-Event-Id': payload.event.id,
      'X-ETK-Event-Time': payload.event.occurred_at,
    };

    if (webhookSecret) {
      headers['X-ETK-Signature'] = createWebhookSignature(webhookSecret, body);
      headers['X-ETK-Signature-Alg'] = 'sha256';
    }

    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          logger.info('[Webhook] Delivered order webhook', {
            eventType,
            webhookUrl,
            attempt,
            status: response.status,
            orderNumber: payload.order?.order_number || null,
          });
          return { success: true, status: response.status };
        }

        const text = await response.text().catch(() => '');
        logger.warn('[Webhook] Non-2xx webhook response', {
          eventType,
          webhookUrl,
          attempt,
          status: response.status,
          body: text.slice(0, 500),
        });
      } catch (error) {
        clearTimeout(timeout);
        logger.warn('[Webhook] Webhook attempt failed', {
          eventType,
          webhookUrl,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { success: false, skipped: false, reason: 'delivery_failed' };
  } catch (error) {
    logger.error('[Webhook] Unexpected webhook error', {
      eventType,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, skipped: false, reason: 'unexpected_error' };
  }
}

function buildOrderWebhookPayload(eventType, order, items, metadata = {}) {
  const normalizedItems = Array.isArray(items)
    ? items.map((item) => {
        const options = item.selected_options && typeof item.selected_options === 'object' && !Array.isArray(item.selected_options)
          ? Object.fromEntries(
              Object.entries(item.selected_options)
                .map(([key, value]) => [String(key).trim(), typeof value === 'string' ? value.trim() : ''])
                .filter(([key, value]) => key && value)
            )
          : {};
        const optionSuffix = Object.keys(options).length > 0
          ? ` (${Object.entries(options).map(([key, value]) => `${key}: ${value}`).join('، ')})`
          : '';

        return {
        product: `${item.product_name}${optionSuffix}`,
        options,
        quantity: Number(item.quantity) || 0,
        price: Number(item.unit_price) || 0,
      };
    })
    : [];

  const totalItemsQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const productSummary = normalizedItems.map((item) => item.product).filter(Boolean).join('، ') || null;
  const orderDate = order.created_at || order.updated_at || null;

  return {
    event: {
      id: crypto.randomUUID(),
      type: eventType,
      source: 'express-trade-kit',
      version: '1.0',
      occurred_at: new Date().toISOString(),
    },
    order: {
      date: orderDate,
      order_id: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      wilaya: order.wilaya || null,
      commune: order.commune || null,
      delivery_type: order.delivery_type || null,
      product: productSummary,
      quantity: totalItemsQuantity,
      price: Number(order.subtotal) || 0,
      shipping: Number(order.shipping_cost) || 0,
      total: Number(order.total) || 0,
      status: order.status,
    },
    items: normalizedItems,
    metadata,
  };
}

// POST /api/integrations/facebook-capi
async function facebookCapi(req, res, next) {
  try {
    const settings = await getMarketingSettings();

    const PIXEL_ID = settings.pixel_id || settings.facebook_pixel_id || process.env.FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = settings.capi_token || settings.access_token || process.env.FACEBOOK_ACCESS_TOKEN;
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

    if (user_data.ph) {
      hashedUserData.ph = [sha256(normalizePhone(user_data.ph))];
    }
    if (user_data.fn) {
      hashedUserData.fn = [sha256(user_data.fn)];
    }
    if (user_data.ln) {
      hashedUserData.ln = [sha256(user_data.ln)];
    }
    if (user_data.ct) {
      hashedUserData.ct = [sha256(user_data.ct)];
    }
    if (user_data.st) {
      hashedUserData.st = [sha256(user_data.st)];
    }
    if (user_data.em) {
      hashedUserData.em = [sha256(user_data.em)];
    }

    if (clientIp) {
      hashedUserData.client_ip_address = clientIp;
    }
    if (user_data.client_user_agent) {
      hashedUserData.client_user_agent = user_data.client_user_agent;
    }
    if (user_data.fbp) {
      hashedUserData.fbp = user_data.fbp;
    }
    if (user_data.fbc) {
      hashedUserData.fbc = user_data.fbc;
    }

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

    res.json({
      success: true,
      events_received: fbResult.events_received,
      messages: fbResult.messages || [],
    });
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
    
    if (!settings.api_configured) {
      return { success: false, error: "API is not configured" };
    }
    
    const INSTANCE_ID = settings.instance_id || process.env.GREEN_API_INSTANCE_ID;
    const API_TOKEN = settings.api_token || process.env.GREEN_API_TOKEN;

    if (!INSTANCE_ID || !API_TOKEN) {
      return { success: false, error: "Missing Green API credentials" };
    }

    if (!template || !phone) {
      return { success: false, error: "template and phone are required" };
    }

    let message;
    if (template === "custom") {
      message = data?.message || "";
    } else {
      const templateFn = TEMPLATES[template];
      if (!templateFn) {
        return { success: false, error: `Unknown template: ${template}` };
      }
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
      const errorText = await greenResponse.text();
      console.error("[WhatsApp] Green API error:", errorText);
      return { success: false, error: errorText || "Green API request failed" };
    }

    const payload = await greenResponse.json().catch(() => ({}));
    return { success: true, idMessage: payload.idMessage };
  } catch (err) {
    console.error("[WhatsApp] Exception:", err);
    return { success: false, error: err.message || "Unexpected WhatsApp error" };
  }
}

// POST /api/integrations/whatsapp-notify
// Protected route for admin testing/manual sends.
async function whatsappNotify(req, res, next) {
  try {
    const { template, phone, data } = req.body;
    const result = await sendWhatsAppInternal({ template, phone, data });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    next(err);
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

async function testOrderWebhook(req, res, next) {
  try {
    const sampleOrder = {
      id: '00000000-0000-0000-0000-000000000000',
      order_number: 999999,
      status: 'new',
      customer_id: null,
      customer_name: 'زبون تجريبي',
      customer_phone: '0555123456',
      wilaya: 'الجزائر',
      commune: 'باب الزوار',
      address: 'حي تجريبي 123',
      delivery_type: 'home',
      subtotal: 4500,
      shipping_cost: 600,
      total: 5100,
      shipping_company: null,
      tracking_number: null,
      call_attempts: 0,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sampleItems = [
      { product_id: 'sample-product-1', product_name: 'منتج تجريبي 1', quantity: 2, unit_price: 1500, total: 3000 },
      { product_id: 'sample-product-2', product_name: 'منتج تجريبي 2', quantity: 1, unit_price: 1500, total: 1500 },
    ];

    const payload = buildOrderWebhookPayload('order.test', sampleOrder, sampleItems, {
      triggered_from: 'admin_marketing_page',
      test: true,
    });

    const result = await sendOrderWebhook('order.test', payload);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.reason || 'Webhook delivery failed',
      });
    }

    res.json({ success: true, payload });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  facebookCapi,
  whatsappNotify,
  updateGreenApi,
  triggerOrderStatusNotification,
  sendOrderWebhook,
  buildOrderWebhookPayload,
  testOrderWebhook,
};
