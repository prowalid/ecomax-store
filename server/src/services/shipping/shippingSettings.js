const pool = require('../../config/db');

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
};

function isRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function mergeShippingSettings(rawValue) {
  const value = isRecord(rawValue) ? rawValue : {};
  const provider = isRecord(value.provider) ? value.provider : {};
  const yalidine = isRecord(value.yalidine) ? value.yalidine : {};

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
  };
}

async function getShippingSettings() {
  const { rows } = await pool.query("SELECT value FROM store_settings WHERE key = 'shipping' LIMIT 1");
  return mergeShippingSettings(rows[0]?.value);
}

module.exports = {
  DEFAULT_SHIPPING_SETTINGS,
  getShippingSettings,
  mergeShippingSettings,
};
