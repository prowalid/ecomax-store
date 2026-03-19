class GetOrdersUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute() {
    return this.orderRepository.listAll();
  }
}

module.exports = {
  GetOrdersUseCase,
};
