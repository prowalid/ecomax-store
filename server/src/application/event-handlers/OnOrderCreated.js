function formatNotificationItems(items) {
  if (!Array.isArray(items) || items.length === 0) return '—';

  return items
    .map((item) => `${item.product_name} × ${item.quantity}`)
    .join('، ');
}

function createOnOrderCreatedHandler({ orderWebhookService }) {
  return async function onOrderCreated({ order, items }) {
    const webhookPayload = orderWebhookService.buildOrderWebhookPayload('order.created', order, items, {
      trigger: 'order_create',
    });

    void orderWebhookService.sendOrderWebhook('order.created', webhookPayload);

    void orderWebhookService.triggerOrderStatusNotification(order.order_number, 'new', {
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      total: String(order.total),
      address: order.address || '',
      state: order.wilaya || '',
      items: formatNotificationItems(items),
    });
  };
}

module.exports = {
  createOnOrderCreatedHandler,
};
