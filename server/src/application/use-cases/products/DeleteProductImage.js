class DeleteProductImageUseCase {
  constructor({ productRepository, cacheService }) {
    this.productRepository = productRepository;
    this.cacheService = cacheService;
  }

  async execute({ productId, imageId }) {
    const result = await this.productRepository.deleteImage(productId, imageId);
    if (!result) {
      const error = new Error('Product image not found');
      error.status = 404;
      throw error;
    }

    await this.cacheService.invalidateByPrefix('products:');
    return result;
  }
}

module.exports = {
  DeleteProductImageUseCase,
};
