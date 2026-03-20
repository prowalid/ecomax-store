class ListProductsUseCase {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute({ user, search, categoryId, sort, inStockOnly, onSaleOnly, status, page, limit, paginate }) {
    return this.productRepository.list({
      isAdmin: user?.role === 'admin',
      search,
      categoryId,
      sort,
      inStockOnly,
      onSaleOnly,
      status,
      page,
      limit,
      paginate,
    });
  }
}

module.exports = {
  ListProductsUseCase,
};
