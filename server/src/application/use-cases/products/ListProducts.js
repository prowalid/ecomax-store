class ListProductsUseCase {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute({ user }) {
    return this.productRepository.list({
      isAdmin: user?.role === 'admin',
    });
  }
}

module.exports = {
  ListProductsUseCase,
};
