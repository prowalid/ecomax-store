const { NotFoundError } = require('../../../domain/errors/NotFoundError');

class DeleteCategoryUseCase {
  constructor({ categoryRepository, cacheService }) {
    this.categoryRepository = categoryRepository;
    this.cacheService = cacheService;
  }

  async execute({ id }) {
    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory) {
      throw new NotFoundError('Category not found');
    }

    await this.cacheService.invalidateByPrefix('categories:');

    return {
      deletedImageUrl: deletedCategory.image_url,
    };
  }
}

module.exports = {
  DeleteCategoryUseCase,
};
