class EnsureDefaultCategoryImagesUseCase {
  constructor({ categoryDefaultsService }) {
    this.categoryDefaultsService = categoryDefaultsService;
  }

  async execute() {
    await this.categoryDefaultsService.ensureDefaultCategoryImages();
  }
}

module.exports = {
  EnsureDefaultCategoryImagesUseCase,
};
