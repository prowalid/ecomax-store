class ReorderProductImagesUseCase {
  constructor({ productRepository, cacheService }) {
    this.productRepository = productRepository;
    this.cacheService = cacheService;
  }

  async execute({ productId, images }) {
    const result = await this.productRepository.reorderImages(productId, images);
    await this.cacheService.invalidateByPrefix('products:');
    return result;
  }
}

module.exports = {
  ReorderProductImagesUseCase,
};
