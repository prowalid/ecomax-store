const crypto = require('crypto');

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

function createWebhookSignature(secret, rawBody) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

class OrderWebhookService {
  constructor({ settingsRepository, logger, whatsAppMessagingService }) {
    this.settingsRepository = settingsRepository;
    this.logger = logger;
    this.whatsAppMessagingService = whatsAppMessagingService;
  }

  async getMarketingSettings() {
    const rows = await this.settingsRepository.findValuesByKeys(['marketing', 'marketing_settings']);
    return rows.reduce((acc, row) => ({ ...acc, ...(row.value || {}) }), {});
  }

  buildOrderWebhookPayload(eventType, order, items, metadata = {}) {
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

    return {
      event: {
        id: crypto.randomUUID(),
        type: eventType,
        source: 'ecomax-store',
        version: '1.0',
        occurred_at: new Date().toISOString(),
      },
      order: {
        date: order.created_at || order.updated_at || null,
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

  async sendOrderWebhook(eventType, payload) {
    try {
      const settings = await this.getMarketingSettings();
      const webhookUrl = sanitizeWebhookUrl(settings.webhook_url);

      if (!webhookUrl) {
        return { success: false, skipped: true, reason: 'webhook_url_not_configured' };
      }

      const body = JSON.stringify(payload);
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'ExpressTradeKit-Webhook/1.0',
        'X-ETK-Event': eventType,
        'X-ETK-Event-Id': payload.event.id,
        'X-ETK-Event-Time': payload.event.occurred_at,
      };

      const webhookSecret = String(settings.webhook_secret || '').trim();
      if (webhookSecret) {
        headers['X-ETK-Signature'] = createWebhookSignature(webhookSecret, body);
        headers['X-ETK-Signature-Alg'] = 'sha256';
      }

      for (let attempt = 1; attempt <= 2; attempt += 1) {
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
            this.logger.info('[Webhook] Delivered order webhook', {
              eventType,
              webhookUrl,
              attempt,
              status: response.status,
              orderNumber: payload.order?.order_id || null,
            });
            return { success: true, status: response.status };
          }

          const text = await response.text().catch(() => '');
          this.logger.warn('[Webhook] Non-2xx webhook response', {
            eventType,
            webhookUrl,
            attempt,
            status: response.status,
            body: text.slice(0, 500),
          });
        } catch (error) {
          clearTimeout(timeout);
          this.logger.warn('[Webhook] Webhook attempt failed', {
            eventType,
            webhookUrl,
            attempt,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return { success: false, skipped: false, reason: 'delivery_failed' };
    } catch (error) {
      this.logger.error('[Webhook] Unexpected webhook error', {
        eventType,
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, skipped: false, reason: 'unexpected_error' };
    }
  }

  async triggerOrderStatusNotification(orderId, newStatus, orderData) {
    try {
      const settings = await this.settingsRepository.findValueByKey('whatsapp_notifications') || {};
      if (!settings.api_configured) return;

      const statusToTemplate = {
        confirmed: 'order_confirmed',
        shipped: 'order_shipped',
        delivered: 'order_delivered',
      };

      const template = statusToTemplate[newStatus];
      if (template && settings.enabled_notifications?.[template]) {
        void this.whatsAppMessagingService.send({
          template,
          phone: orderData.customer_phone,
          data: { order_id: orderId, ...orderData },
        });
      }

      if (newStatus === 'new' && settings.enabled_notifications?.new_order_admin && settings.admin_phone) {
        void this.whatsAppMessagingService.send({
          template: 'new_order_admin',
          phone: settings.admin_phone,
          data: { order_id: orderId, ...orderData },
        });
      }
    } catch (error) {
      this.logger.error('[WhatsApp] Auto-trigger error', {
        orderId,
        newStatus,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

module.exports = {
  OrderWebhookService,
};
