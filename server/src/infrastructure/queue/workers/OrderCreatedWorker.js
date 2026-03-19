function formatNotificationItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '—';
  }

  return items
    .map((item) => `${item.product_name} × ${item.quantity}`)
    .join('، ');
}

class OrderCreatedWorker {
  static eventName = 'order.created';

  constructor({ orderWebhookService, logger }) {
    this.orderWebhookService = orderWebhookService;
    this.logger = logger;
  }

  async process({ order, items }) {
    const webhookPayload = this.orderWebhookService.buildOrderWebhookPayload(
      OrderCreatedWorker.eventName,
      order,
      items,
      { trigger: 'order_create' }
    );

    this.logger?.info?.('[QueueWorker] Processing order.created', {
      orderId: order?.id || null,
      orderNumber: order?.order_number || null,
    });

    await Promise.allSettled([
      this.orderWebhookService.sendOrderWebhook(OrderCreatedWorker.eventName, webhookPayload),
      this.orderWebhookService.triggerOrderStatusNotification(order.order_number, 'new', {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        total: String(order.total),
        address: order.address || '',
        state: order.wilaya || '',
        items: formatNotificationItems(items),
      }),
    ]);
  }
}

module.exports = {
  OrderCreatedWorker,
};
