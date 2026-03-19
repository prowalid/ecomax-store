const { NotFoundError } = require('../../../domain/errors/NotFoundError');

class DeletePageUseCase {
  constructor({ pageRepository, cacheService }) {
    this.pageRepository = pageRepository;
    this.cacheService = cacheService;
  }

  async execute({ id }) {
    const deleted = await this.pageRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Page not found');
    }

    await this.cacheService.invalidateByPrefix('pages:');
  }
}

module.exports = {
  DeletePageUseCase,
};
