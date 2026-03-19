class GetOrderItemsUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ orderId }) {
    return this.orderRepository.findAllItemsByOrderId(orderId);
  }
}

module.exports = {
  GetOrderItemsUseCase,
};
