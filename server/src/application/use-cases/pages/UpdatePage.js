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
    const { version, ...rawUpdates } = updates;

    if (!Number.isInteger(version) || version < 1) {
      throw new ValidationError('Version is required');
    }

    if (Object.keys(rawUpdates).length === 0) {
      throw new ValidationError('No fields to update');
    }

    const currentPage = await this.pageRepository.findById(id);
    if (!currentPage) {
      throw new NotFoundError('Page not found');
    }

    const nextUpdates = { ...rawUpdates };

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
      new Page(currentPage).applyUpdates(nextUpdates),
      version
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
