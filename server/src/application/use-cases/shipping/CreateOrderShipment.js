const { createYalidineShipment, createGuepexShipment } = require('../../../services/shipping/providers/yalidineProvider');

const SHIPPING_PROVIDER_HANDLERS = {
  yalidine: {
    label: 'Yalidine',
    settingsKey: 'yalidine',
    createShipment: createYalidineShipment,
  },
  guepex: {
    label: 'Guepex',
    settingsKey: 'guepex',
    createShipment: createGuepexShipment,
  },
};

class CreateOrderShipmentUseCase {
  constructor({ orderRepository, shippingSettingsService, shipmentProviders = SHIPPING_PROVIDER_HANDLERS }) {
    this.orderRepository = orderRepository;
    this.shippingSettingsService = shippingSettingsService;
    this.shipmentProviders = shipmentProviders;
  }

  async execute({ orderId }) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    const items = await this.orderRepository.findItemsByOrderId(orderId);
    const shippingSettings = await this.shippingSettingsService.getSettings();

    const activeProvider = shippingSettings.provider?.active_provider;
    const providerConfig = this.shipmentProviders[activeProvider];

    if (!providerConfig) {
      const error = new Error('لا يوجد مزود شحن مباشر مفعل حاليًا');
      error.status = 400;
      throw error;
    }

    if (order.shipping_company === providerConfig.settingsKey && order.tracking_number) {
      const error = new Error(`تم رفع هذا الطلب إلى ${providerConfig.label} مسبقًا`);
      error.status = 409;
      throw error;
    }

    const shipment = await providerConfig.createShipment({
      order,
      items,
      settings: shippingSettings[providerConfig.settingsKey] || {},
    });

    const updatedOrder = await this.orderRepository.updateShipmentInfo(orderId, {
      shippingCompany: providerConfig.settingsKey,
      trackingNumber: shipment.tracking_number,
      shippingLabelUrl: shipment.shipping_label_url,
    });

    return {
      success: true,
      provider: providerConfig.settingsKey,
      provider_label: providerConfig.label,
      tracking_number: shipment.tracking_number,
      shipping_label_url: shipment.shipping_label_url,
      order: updatedOrder,
      shipment_response: shipment.response,
    };
  }
}

module.exports = {
  CreateOrderShipmentUseCase,
};
