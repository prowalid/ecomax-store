const { NotFoundError } = require('../../../domain/errors/NotFoundError');
const { ConflictError } = require('../../../domain/errors/ConflictError');
const { Order } = require('../../../domain/entities/Order');
const { OrderStatusUpdatedEvent } = require('../../../domain/events/OrderStatusUpdatedEvent');

class UpdateOrderStatusUseCase {
  constructor({ orderRepository, eventBus }) {
    this.orderRepository = orderRepository;
    this.eventBus = eventBus;
  }

  async execute({ orderId, status }) {
    const result = await this.orderRepository.withTransaction(async (client) => {
      const currentOrder = await this.orderRepository.getStatusSnapshot(client, orderId);

      if (!currentOrder) {
        throw new NotFoundError('Order not found');
      }

      const currentOrderEntity = new Order({
        ...currentOrder,
        requireCustomerIdentity: false,
        subtotal: 0,
        shipping_cost: 0,
        total: 0,
      });
      const oldStatus = currentOrderEntity.status;
      const transition = currentOrderEntity.transitionTo(status);

      const updatedOrder = await this.orderRepository.updateStatus(client, orderId, {
        status: transition.status,
        callAttempts: transition.callAttempts,
      });

      if (transition.stockDirection !== 0) {
        const items = await this.orderRepository.getOrderItems(client, orderId);
        const stockRows = await this.orderRepository.adjustStock(client, items, transition.stockDirection);

        for (const row of stockRows) {
          if (row.stock < 0) {
            throw new ConflictError(`Insufficient stock for product: ${row.name || row.id}`, {
              code: 'INSUFFICIENT_STOCK',
              statusCode: 400,
            });
          }
        }
      }

      const orderItems = await this.orderRepository.getDetailedOrderItems(client, orderId);

      return {
        oldStatus,
        updatedOrder,
        orderItems,
      };
    });

    await this.eventBus.publish(new OrderStatusUpdatedEvent({
      previousStatus: result.oldStatus,
      currentStatus: result.updatedOrder.status,
      order: result.updatedOrder,
      items: result.orderItems,
    }));

    return result;
  }
}

module.exports = {
  UpdateOrderStatusUseCase,
};
