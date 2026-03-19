const { ConflictError } = require('../../../domain/errors/ConflictError');
const { Page } = require('../../../domain/entities/Page');

class CreatePageUseCase {
  constructor({ pageRepository, cacheService }) {
    this.pageRepository = pageRepository;
    this.cacheService = cacheService;
  }

  async execute({ title, slug, content = '', published = false, show_in = 'none' }) {
    const pageDraft = new Page({
      title,
      slug,
      content,
      published,
      show_in,
    });
    const normalizedSlug = pageDraft.slug;

    const existingPage = await this.pageRepository.findBySlug(normalizedSlug);
    if (existingPage) {
      throw new ConflictError('Page slug already exists');
    }

    const createdPage = await this.pageRepository.create(pageDraft);

    await this.cacheService.invalidateByPrefix('pages:');
    return createdPage;
  }
}

module.exports = {
  CreatePageUseCase,
};
