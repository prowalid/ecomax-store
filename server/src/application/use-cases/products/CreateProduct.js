const { Product } = require('../../../domain/entities/Product');

class CreateProductUseCase {
  constructor({ productRepository, normalizeCustomOptions, cacheService }) {
    this.productRepository = productRepository;
    this.normalizeCustomOptions = normalizeCustomOptions;
    this.cacheService = cacheService;
  }

  async execute(data) {
    const productDraft = new Product({
      ...data,
      custom_options: this.normalizeCustomOptions(data.custom_options),
    });
    const product = await this.productRepository.create(productDraft);

    await this.cacheService.invalidateByPrefix('products:');
    return product;
  }
}

module.exports = {
  CreateProductUseCase,
};
