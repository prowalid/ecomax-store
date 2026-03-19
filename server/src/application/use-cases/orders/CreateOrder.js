const { ValidationError } = require('../../../domain/errors/ValidationError');
const { Order } = require('../../../domain/entities/Order');
const { Product } = require('../../../domain/entities/Product');
const { OrderCreatedEvent } = require('../../../domain/events/OrderCreatedEvent');

class CreateOrderUseCase {
  constructor({ orderRepository, normalizeSelectedOptions, eventBus }) {
    this.orderRepository = orderRepository;
    this.normalizeSelectedOptions = normalizeSelectedOptions;
    this.eventBus = eventBus;
  }

  async execute({ body, requestIp }) {
    const { items, ...rawOrderData } = body;

    const result = await this.orderRepository.withTransaction(async (client) => {
      const productIds = [...new Set(items.map((item) => item.product_id))];
      const dbProducts = await this.orderRepository.lockProducts(client, productIds);

      if (dbProducts.length !== productIds.length) {
        throw new ValidationError('One or more products are missing.');
      }

      const productsById = new Map(
        dbProducts.map((product) => [product.id, new Product(product)])
      );
      const preparedItems = items.map((item) => ({
        ...item,
        selected_options: this.normalizeSelectedOptions(item.selected_options),
      }));

      const requestedQtyByProduct = {};
      const normalizedItems = preparedItems.map((item) => {
        const product = productsById.get(item.product_id);
        if (!product) {
          throw new ValidationError('One or more products are missing.');
        }

        requestedQtyByProduct[item.product_id] = (requestedQtyByProduct[item.product_id] || 0) + item.quantity;
        product.ensureCanReserve(requestedQtyByProduct[item.product_id]);

        return product.toOrderItem({
          quantity: item.quantity,
          selected_options: item.selected_options,
        });
      });

      const orderDraft = Order.fromCheckoutDraft({
        rawOrderData,
        items: normalizedItems,
        requestIp,
      });

      const newOrder = await this.orderRepository.createOrder(client, orderDraft);
      await this.orderRepository.insertOrderItems(
        client,
        newOrder.id,
        normalizedItems.map((item) => item.toPersistence())
      );
      await this.orderRepository.adjustStock(
        client,
        normalizedItems.map((item) => item.toPersistence()),
        -1
      );

      return {
        newOrder,
        normalizedItems: normalizedItems.map((item) => item.toPersistence()),
      };
    });

    await this.eventBus.publish(new OrderCreatedEvent({
      order: result.newOrder,
      items: result.normalizedItems,
    }));

    return result;
  }
}

module.exports = {
  CreateOrderUseCase,
};
