class GetProductImagesUseCase {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute({ productId }) {
    return this.productRepository.listImages(productId);
  }
}

module.exports = {
  GetProductImagesUseCase,
};
