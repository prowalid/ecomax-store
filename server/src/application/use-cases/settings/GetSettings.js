const PUBLIC_MARKETING_FIELDS = new Set(['pixel_id', 'pixel_configured', 'enabled_events', 'facebook_pixel_id']);
const PUBLIC_SECURITY_FIELDS = new Set(['turnstile_enabled', 'site_key', 'honeypot_enabled']);

function pickAllowedFields(value, allowedFields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([key]) => allowedFields.has(key))
  );
}

class GetSettingsUseCase {
  constructor({ settingsRepository, cacheService }) {
    this.settingsRepository = settingsRepository;
    this.cacheService = cacheService;
  }

  async execute({ key, isAdmin }) {
    const cacheScope = isAdmin ? 'admin' : 'public';
    const storedValue = await this.cacheService.getOrSet(
      `settings:${cacheScope}:${key}`,
      30 * 1000,
      () => this.settingsRepository.findValueByKey(key)
    );

    if (storedValue === null) {
      return { value: {} };
    }

    if (!isAdmin && key === 'marketing') {
      return { value: pickAllowedFields(storedValue, PUBLIC_MARKETING_FIELDS) };
    }

    if (!isAdmin && key === 'security') {
      return { value: pickAllowedFields(storedValue, PUBLIC_SECURITY_FIELDS) };
    }

    return { value: storedValue };
  }
}

module.exports = {
  GetSettingsUseCase,
};

