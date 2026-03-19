function formatNotificationItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '—';
  }

  return items
    .map((item) => `${item.product_name} × ${item.quantity}`)
    .join('، ');
}

class OrderStatusUpdatedWorker {
  static eventName = 'order.status_updated';

  constructor({ orderWebhookService, logger }) {
    this.orderWebhookService = orderWebhookService;
    this.logger = logger;
  }

  async process({ previousStatus, currentStatus, order, items }) {
    const webhookPayload = this.orderWebhookService.buildOrderWebhookPayload(
      OrderStatusUpdatedWorker.eventName,
      order,
      items,
      {
        trigger: 'order_status_update',
        previous_status: previousStatus,
        current_status: currentStatus,
      }
    );

    this.logger?.info?.('[QueueWorker] Processing order.status_updated', {
      orderId: order?.id || null,
      orderNumber: order?.order_number || null,
      previousStatus,
      currentStatus,
    });

    await Promise.allSettled([
      this.orderWebhookService.sendOrderWebhook(OrderStatusUpdatedWorker.eventName, webhookPayload),
      this.orderWebhookService.triggerOrderStatusNotification(order.order_number, currentStatus, {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        total: String(order.total),
        address: order.address || '',
        state: order.wilaya || '',
        tracking_number: order.tracking_number || '',
        shipping_company: order.shipping_company || '',
        items: formatNotificationItems(items),
      }),
    ]);
  }
}

module.exports = {
  OrderStatusUpdatedWorker,
};
