const DEFAULT_SHIPPING_SETTINGS = {
  wilayas: [],
  provider: {
    active_provider: 'manual',
  },
  yalidine: {
    enabled: false,
    api_base_url: 'https://api.yalidine.app/v1',
    api_id: '',
    api_token: '',
    shipper_name: '',
    shipper_phone: '',
    from_wilaya_name: '',
    from_commune_name: '',
    stopdesk_id: '',
    default_product_name: '',
  },
  guepex: {
    enabled: false,
    api_base_url: 'https://api.guepex.app/v1',
    api_id: '',
    api_token: '',
    shipper_name: '',
    shipper_phone: '',
    from_wilaya_name: '',
    from_commune_name: '',
    stopdesk_id: '',
    default_product_name: '',
  },
};

function isRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function mergeShippingSettings(rawValue) {
  const value = isRecord(rawValue) ? rawValue : {};
  const provider = isRecord(value.provider) ? value.provider : {};
  const yalidine = isRecord(value.yalidine) ? value.yalidine : {};
  const guepex = isRecord(value.guepex) ? value.guepex : {};

  return {
    ...DEFAULT_SHIPPING_SETTINGS,
    ...value,
    provider: {
      ...DEFAULT_SHIPPING_SETTINGS.provider,
      ...provider,
    },
    yalidine: {
      ...DEFAULT_SHIPPING_SETTINGS.yalidine,
      ...yalidine,
    },
    guepex: {
      ...DEFAULT_SHIPPING_SETTINGS.guepex,
      ...guepex,
    },
  };
}

class ShippingSettingsService {
  constructor({ settingsRepository }) {
    this.settingsRepository = settingsRepository;
  }

  async getSettings() {
    const rawValue = await this.settingsRepository.findValueByKey('shipping');
    return mergeShippingSettings(rawValue);
  }
}

module.exports = {
  DEFAULT_SHIPPING_SETTINGS,
  mergeShippingSettings,
  ShippingSettingsService,
};
