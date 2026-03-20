class GetCustomersUseCase {
  constructor({ customerRepository }) {
    this.customerRepository = customerRepository;
  }

  async execute({ search, page = 1, limit = 20, paginate = false } = {}) {
    if (paginate) {
      return this.customerRepository.list({
        search,
        page,
        limit,
        paginate,
      });
    }

    return this.customerRepository.findAll();
  }
}

module.exports = {
  GetCustomersUseCase,
};
