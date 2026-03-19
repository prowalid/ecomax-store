function formatNotificationItems(items) {
  if (!Array.isArray(items) || items.length === 0) return '—';

  return items
    .map((item) => `${item.product_name} × ${item.quantity}`)
    .join('، ');
}

function createOnOrderStatusUpdatedHandler({ orderWebhookService }) {
  return async function onOrderStatusUpdated({ previousStatus, currentStatus, order, items }) {
    const webhookPayload = orderWebhookService.buildOrderWebhookPayload('order.status_updated', order, items, {
      trigger: 'order_status_update',
      previous_status: previousStatus,
      current_status: currentStatus,
    });

    void orderWebhookService.sendOrderWebhook('order.status_updated', webhookPayload);

    void orderWebhookService.triggerOrderStatusNotification(order.order_number, currentStatus, {
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      total: String(order.total),
      address: order.address || '',
      state: order.wilaya || '',
      tracking_number: order.tracking_number || '',
      shipping_company: order.shipping_company || '',
      items: formatNotificationItems(items),
    });
  };
}

module.exports = {
  createOnOrderStatusUpdatedHandler,
};
