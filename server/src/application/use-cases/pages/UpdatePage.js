const { ValidationError } = require('../../../domain/errors/ValidationError');
const { ConflictError } = require('../../../domain/errors/ConflictError');
const { NotFoundError } = require('../../../domain/errors/NotFoundError');
const { Page } = require('../../../domain/entities/Page');

class UpdatePageUseCase {
  constructor({ pageRepository, cacheService }) {
    this.pageRepository = pageRepository;
    this.cacheService = cacheService;
  }

  async execute({ id, updates }) {
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No fields to update');
    }

    const currentPage = await this.pageRepository.findById(id);
    if (!currentPage) {
      throw new NotFoundError('Page not found');
    }

    const nextUpdates = { ...updates };

    if (nextUpdates.slug !== undefined) {
      nextUpdates.slug = new Page({
        ...currentPage,
        slug: nextUpdates.slug,
      }).slug;

      const existingPage = await this.pageRepository.findBySlugExcludingId(nextUpdates.slug, id);
      if (existingPage) {
        throw new ConflictError('Page slug already exists');
      }
    }

    const updatedPage = await this.pageRepository.update(
      id,
      new Page(currentPage).applyUpdates(nextUpdates)
    );
    if (updatedPage?.type === 'invalid') {
      throw new ValidationError('No valid fields to update');
    }

    await this.cacheService.invalidateByPrefix('pages:');
    return updatedPage;
  }
}

module.exports = {
  UpdatePageUseCase,
};
