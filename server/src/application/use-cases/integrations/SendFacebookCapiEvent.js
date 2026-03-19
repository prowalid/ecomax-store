const crypto = require('crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '').trim().toLowerCase()).digest('hex');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizePhone(phone) {
  let digits = String(phone || '').replace(/[^\d+]/g, '').replace(/\+/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) {
    digits = `213${digits.slice(1)}`;
  } else if (digits.length === 9 && !digits.startsWith('213')) {
    digits = `213${digits}`;
  }

  return digits;
}

class SendFacebookCapiEventUseCase {
  constructor({ settingsRepository, logger }) {
    this.settingsRepository = settingsRepository;
    this.logger = logger;
  }

  async getMarketingSettings() {
    const rows = await this.settingsRepository.findValuesByKeys(['marketing', 'marketing_settings']);
    return rows.reduce((acc, row) => ({ ...acc, ...(row.value || {}) }), {});
  }

  async execute({ body, clientIp }) {
    const settings = await this.getMarketingSettings();
    const pixelId = settings.pixel_id || settings.facebook_pixel_id || process.env.FACEBOOK_PIXEL_ID;
    const accessToken = settings.capi_token || settings.access_token || process.env.FACEBOOK_ACCESS_TOKEN;
    const testEventCode = process.env.FACEBOOK_TEST_EVENT_CODE;

    if (!pixelId || !accessToken) {
      const error = new Error('الرجاء إعداد بيانات Facebook CAPI في صفحة التسويق أولاً.');
      error.status = 500;
      throw error;
    }

    const { event_name, event_id, event_time, event_source_url, user_data = {}, custom_data } = body;
    if (!event_name || !event_id) {
      const error = new Error('event_name and event_id are required');
      error.status = 400;
      throw error;
    }

    const hashedUserData = {};
    const normalizedPhone = normalizePhone(user_data.ph);
    const normalizedExternalId = normalizePhone(user_data.external_id || user_data.ph);
    const normalizedFirstName = normalizeText(user_data.fn);
    const normalizedLastName = normalizeText(user_data.ln);
    const normalizedCity = normalizeText(user_data.ct);
    const normalizedState = normalizeText(user_data.st);
    const normalizedEmail = normalizeText(user_data.em);
    const normalizedCountry = normalizeText(user_data.country || 'dz');

    if (normalizedPhone) hashedUserData.ph = [sha256(normalizedPhone)];
    if (normalizedExternalId) hashedUserData.external_id = [sha256(normalizedExternalId)];
    if (normalizedFirstName) hashedUserData.fn = [sha256(normalizedFirstName)];
    if (normalizedLastName) hashedUserData.ln = [sha256(normalizedLastName)];
    if (normalizedCity) hashedUserData.ct = [sha256(normalizedCity)];
    if (normalizedState) hashedUserData.st = [sha256(normalizedState)];
    if (normalizedEmail) hashedUserData.em = [sha256(normalizedEmail)];
    if (normalizedCountry) hashedUserData.country = [sha256(normalizedCountry)];
    if (clientIp) hashedUserData.client_ip_address = clientIp;
    if (user_data.client_user_agent) hashedUserData.client_user_agent = user_data.client_user_agent;
    if (user_data.fbp) hashedUserData.fbp = user_data.fbp;
    if (user_data.fbc) hashedUserData.fbc = user_data.fbc;

    const eventPayload = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: 'website',
      user_data: hashedUserData,
    };

    if (custom_data && Object.keys(custom_data).length > 0) {
      eventPayload.custom_data = custom_data;
    }

    const payload = { data: [eventPayload] };
    if (testEventCode) payload.test_event_code = testEventCode;

    const response = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      this.logger.error('[CAPI] Facebook API error', result);
      const error = new Error(result.error?.message || 'Facebook API error');
      error.status = response.status;
      error.details = result;
      throw error;
    }

    return {
      success: true,
      events_received: result.events_received,
      messages: result.messages || [],
    };
  }
}

module.exports = {
  SendFacebookCapiEventUseCase,
};
