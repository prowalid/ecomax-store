class OrderStatusUpdatedEvent {
  constructor({ previousStatus, currentStatus, order, items }) {
    this.name = 'order.status_updated';
    this.payload = {
      previousStatus,
      currentStatus,
      order,
      items,
    };
  }
}

module.exports = {
  OrderStatusUpdatedEvent,
};
