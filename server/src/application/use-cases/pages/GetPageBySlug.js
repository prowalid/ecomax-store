const { Slug } = require('../../../domain/value-objects/Slug');
const { NotFoundError } = require('../../../domain/errors/NotFoundError');

class GetPageBySlugUseCase {
  constructor({ pageRepository, cacheService }) {
    this.pageRepository = pageRepository;
    this.cacheService = cacheService;
  }

  async execute({ slug }) {
    const normalizedSlug = new Slug(slug).value;
    const page = await this.cacheService.getOrSet(
      `pages:slug:${normalizedSlug}`,
      60 * 1000,
      () => this.pageRepository.findPublishedBySlug(normalizedSlug)
    );

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    return page;
  }
}

module.exports = {
  GetPageBySlugUseCase,
};
