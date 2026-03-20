const { Product } = require('../../../domain/entities/Product');
const { buildUniqueSlug } = require('../../../utils/buildUniqueSlug');

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
    productDraft.slug = await buildUniqueSlug(productDraft.slug, async (candidate) => {
      const existingProduct = await this.productRepository.findBySlug(candidate);
      return Boolean(existingProduct);
    }, productDraft.name);
    const product = await this.productRepository.create(productDraft);

    await this.cacheService.invalidateByPrefix('products:');
    return product;
  }
}

module.exports = {
  CreateProductUseCase,
};
