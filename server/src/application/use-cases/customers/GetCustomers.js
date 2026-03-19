class GetCustomersUseCase {
  constructor({ customerRepository }) {
    this.customerRepository = customerRepository;
  }

  async execute() {
    return this.customerRepository.findAll();
  }
}

module.exports = {
  GetCustomersUseCase,
};

