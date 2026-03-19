class EnsurePagesSlugIntegrityUseCase {
  constructor({ pageIntegrityService }) {
    this.pageIntegrityService = pageIntegrityService;
  }

  async execute() {
    await this.pageIntegrityService.ensureUniqueNormalizedSlugs();
  }
}

module.exports = {
  EnsurePagesSlugIntegrityUseCase,
};
