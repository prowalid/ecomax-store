class AddProductImageUseCase {
  constructor({ productRepository, cacheService }) {
    this.productRepository = productRepository;
    this.cacheService = cacheService;
  }

  async execute({ productId, imageUrl }) {
    const image = await this.productRepository.addImage(productId, imageUrl);
    await this.cacheService.invalidateByPrefix('products:');
    return image;
  }
}

module.exports = {
  AddProductImageUseCase,
};
