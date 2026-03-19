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

class WhatsAppMessagingService {
  constructor({ settingsRepository, logger }) {
    this.settingsRepository = settingsRepository;
    this.logger = logger;
  }

  async getSettings() {
    return this.settingsRepository.findValueByKey('whatsapp_notifications') || {};
  }

  buildMessage(template, data) {
    if (template === 'custom') {
      return data?.message || '';
    }

    const templateFn = TEMPLATES[template];
    if (!templateFn) {
      throw new Error(`Unknown template: ${template}`);
    }

    return templateFn(data || {});
  }

  normalizeChatId(phone) {
    let chatId = String(phone || '').replace(/[\s\-\+\(\)]/g, '');
    if (chatId.startsWith('0')) chatId = `213${chatId.substring(1)}`;
    if (chatId && !chatId.includes('@')) chatId = `${chatId}@c.us`;
    return chatId;
  }

  async send({ template, phone, data }) {
    const settings = await this.getSettings();

    if (!settings.api_configured) {
      return { success: false, error: 'API is not configured' };
    }

    const instanceId = settings.instance_id || process.env.GREEN_API_INSTANCE_ID;
    const apiToken = settings.api_token || process.env.GREEN_API_TOKEN;

    if (!instanceId || !apiToken) {
      return { success: false, error: 'Missing Green API credentials' };
    }

    if (!template || !phone) {
      return { success: false, error: 'template and phone are required' };
    }

    let message;
    try {
      message = this.buildMessage(template, data);
    } catch (error) {
      return { success: false, error: error.message };
    }

    const response = await fetch(`https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: this.normalizeChatId(phone),
        message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error('[WhatsApp] Green API error', {
        status: response.status,
        body: errorText,
      });
      return { success: false, error: errorText || 'Green API request failed' };
    }

    const payload = await response.json().catch(() => ({}));
    return { success: true, idMessage: payload.idMessage };
  }
}

module.exports = {
  WhatsAppMessagingService,
};
