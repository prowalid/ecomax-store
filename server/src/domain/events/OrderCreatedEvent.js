class OrderCreatedEvent {
  constructor({ order, items }) {
    this.name = 'order.created';
    this.payload = {
      order,
      items,
    };
  }
}

module.exports = {
  OrderCreatedEvent,
};
