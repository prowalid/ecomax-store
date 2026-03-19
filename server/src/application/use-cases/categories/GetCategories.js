class GetCategoriesUseCase {
  constructor({ categoryRepository, cacheService }) {
    this.categoryRepository = categoryRepository;
    this.cacheService = cacheService;
  }

  async execute() {
    return this.cacheService.getOrSet(
      'categories:list',
      60 * 1000,
      () => this.categoryRepository.findAll()
    );
  }
}

module.exports = {
  GetCategoriesUseCase,
};

