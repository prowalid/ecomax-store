class TestOrderWebhookUseCase {
  constructor({ orderWebhookService }) {
    this.orderWebhookService = orderWebhookService;
  }

  async execute() {
    const payload = this.orderWebhookService.buildOrderWebhookPayload(
      'order.test',
      {
        order_number: 999999,
        status: 'new',
        customer_name: 'زبون تجريبي',
        customer_phone: '0555123456',
        wilaya: 'الجزائر',
        commune: 'باب الزوار',
        address: 'حي تجريبي 123',
        delivery_type: 'home',
        subtotal: 4500,
        shipping_cost: 600,
        total: 5100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      [
        { product_id: 'sample-product-1', product_name: 'منتج تجريبي 1', quantity: 2, unit_price: 1500, total: 3000 },
        { product_id: 'sample-product-2', product_name: 'منتج تجريبي 2', quantity: 1, unit_price: 1500, total: 1500 },
      ],
      {
        triggered_from: 'admin_marketing_page',
        test: true,
      }
    );

    const result = await this.orderWebhookService.sendOrderWebhook('order.test', payload);
    if (!result.success) {
      const error = new Error(result.reason || 'Webhook delivery failed');
      error.status = 400;
      throw error;
    }

    return {
      success: true,
      payload,
    };
  }
}

module.exports = {
  TestOrderWebhookUseCase,
};
