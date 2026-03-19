class GetAllPagesUseCase {
  constructor({ pageRepository, cacheService }) {
    this.pageRepository = pageRepository;
    this.cacheService = cacheService;
  }

  async execute() {
    return this.cacheService.getOrSet(
      'pages:all',
      30 * 1000,
      () => this.pageRepository.findAll()
    );
  }
}

module.exports = {
  GetAllPagesUseCase,
};

