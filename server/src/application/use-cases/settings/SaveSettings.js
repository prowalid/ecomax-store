const WHATSAPP_ALLOWED_PATTERN = /^[0-9+\-\s()]+$/;

function normalizeWhatsAppPhone(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  let digits = raw.replace(/[^\d+]/g, '').replace(/\+/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length === 10) {
    digits = `213${digits.slice(1)}`;
  } else if (digits.length === 9 && !digits.startsWith('213')) {
    digits = `213${digits}`;
  }

  if (!/^\d{8,15}$/.test(digits)) {
    return null;
  }

  return digits;
}

function sanitizeGeneralSettingsValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Invalid general settings payload' };
  }

  const nextValue = { ...value };

  if (Object.prototype.hasOwnProperty.call(nextValue, 'whatsapp_phone')) {
    const raw = String(nextValue.whatsapp_phone || '').trim();
    if (!raw) {
      nextValue.whatsapp_phone = '';
      return { ok: true, value: nextValue };
    }

    if (!WHATSAPP_ALLOWED_PATTERN.test(raw)) {
      return { ok: false, error: 'Invalid WhatsApp phone format' };
    }

    const normalized = normalizeWhatsAppPhone(raw);
    if (!normalized) {
      return { ok: false, error: 'Invalid WhatsApp phone format' };
    }

    nextValue.whatsapp_phone = `+${normalized}`;
  }

  return { ok: true, value: nextValue };
}

class SaveSettingsUseCase {
  constructor({ settingsRepository, cacheService }) {
    this.settingsRepository = settingsRepository;
    this.cacheService = cacheService;
  }

  async execute({ key, value }) {
    let nextValue = value;

    if (key === 'general') {
      const sanitized = sanitizeGeneralSettingsValue(nextValue);
      if (!sanitized.ok) {
        const error = new Error(sanitized.error);
        error.status = 400;
        throw error;
      }

      nextValue = sanitized.value;
    }

    const previousValue = key === 'appearance'
      ? await this.settingsRepository.findValueByKey(key)
      : null;

    const savedValue = await this.settingsRepository.saveMerged(key, nextValue);
    await this.cacheService.invalidateByPrefix('settings:');

    return {
      value: savedValue,
      previousValue,
    };
  }
}

module.exports = {
  SaveSettingsUseCase,
};
