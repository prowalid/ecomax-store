class GetOrdersUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ search, status, page = 1, limit = 20, paginate = false } = {}) {
    if (paginate) {
      return this.orderRepository.list({
        search,
        status,
        page,
        limit,
        paginate,
      });
    }

    return this.orderRepository.listAll();
  }
}

module.exports = {
  GetOrdersUseCase,
};
