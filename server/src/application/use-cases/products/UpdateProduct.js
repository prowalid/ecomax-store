const { Product } = require('../../../domain/entities/Product');
const { ValidationError } = require('../../../domain/errors/ValidationError');
const { NotFoundError } = require('../../../domain/errors/NotFoundError');
const { buildUniqueSlug } = require('../../../utils/buildUniqueSlug');

class UpdateProductUseCase {
  constructor({ productRepository, normalizeCustomOptions, cacheService }) {
    this.productRepository = productRepository;
    this.normalizeCustomOptions = normalizeCustomOptions;
    this.cacheService = cacheService;
  }

  async execute({ productId, updates }) {
    const { version, ...rawUpdates } = updates;

    if (!Number.isInteger(version) || version < 1) {
      throw new ValidationError('Version is required');
    }

    if (Object.keys(rawUpdates).length === 0) {
      throw new ValidationError('No fields to update');
    }

    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    const preparedUpdates = { ...rawUpdates };
    if (Object.prototype.hasOwnProperty.call(preparedUpdates, 'custom_options')) {
      preparedUpdates.custom_options = this.normalizeCustomOptions(preparedUpdates.custom_options);
    }

    if (typeof preparedUpdates.name === 'string' && preparedUpdates.name.trim() && preparedUpdates.name.trim() !== existingProduct.name) {
      preparedUpdates.slug = await buildUniqueSlug(preparedUpdates.name, async (candidate) => {
        const conflictingProduct = await this.productRepository.findBySlugExcludingId(candidate, productId);
        return Boolean(conflictingProduct);
      }, preparedUpdates.name);
    }

    const updatedProduct = await this.productRepository.update(
      productId,
      new Product(existingProduct).applyUpdates(preparedUpdates),
      version
    );
    if (!updatedProduct) {
      throw new ValidationError('No valid fields to update');
    }

    await this.cacheService.invalidateByPrefix('products:');

    return {
      previousImageUrl: existingProduct.image_url,
      updatedProduct,
    };
  }
}

module.exports = {
  UpdateProductUseCase,
};
