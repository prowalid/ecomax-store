class DeleteProductUseCase {
  constructor({ productRepository, cacheService }) {
    this.productRepository = productRepository;
    this.cacheService = cacheService;
  }

  async execute({ productId }) {
    const snapshot = await this.productRepository.getDeleteSnapshot(productId);
    if (!snapshot) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    await this.productRepository.delete(productId);
    await this.cacheService.invalidateByPrefix('products:');

    return {
      urlsToCleanup: [snapshot.image_url, ...snapshot.gallery_urls],
    };
  }
}

module.exports = {
  DeleteProductUseCase,
};
