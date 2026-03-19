const { Product } = require('../../../domain/entities/Product');
const { ValidationError } = require('../../../domain/errors/ValidationError');
const { NotFoundError } = require('../../../domain/errors/NotFoundError');

class UpdateProductUseCase {
  constructor({ productRepository, normalizeCustomOptions, cacheService }) {
    this.productRepository = productRepository;
    this.normalizeCustomOptions = normalizeCustomOptions;
    this.cacheService = cacheService;
  }

  async execute({ productId, updates }) {
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No fields to update');
    }

    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    const preparedUpdates = { ...updates };
    if (Object.prototype.hasOwnProperty.call(preparedUpdates, 'custom_options')) {
      preparedUpdates.custom_options = this.normalizeCustomOptions(preparedUpdates.custom_options);
    }

    const updatedProduct = await this.productRepository.update(
      productId,
      new Product(existingProduct).applyUpdates(preparedUpdates)
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
