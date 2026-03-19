class GetPublishedPagesUseCase {
  constructor({ pageRepository, cacheService }) {
    this.pageRepository = pageRepository;
    this.cacheService = cacheService;
  }

  async execute({ placement }) {
    return this.cacheService.getOrSet(
      `pages:published:${placement}`,
      60 * 1000,
      () => this.pageRepository.findPublishedByPlacement(placement)
    );
  }
}

module.exports = {
  GetPublishedPagesUseCase,
};

