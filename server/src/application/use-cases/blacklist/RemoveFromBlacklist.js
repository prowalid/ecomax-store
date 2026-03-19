class RemoveFromBlacklistUseCase {
  constructor({ blacklistRepository }) {
    this.blacklistRepository = blacklistRepository;
  }

  async execute({ id }) {
    const deleted = await this.blacklistRepository.deleteById(id);
    if (!deleted) {
      const error = new Error('Entry not found');
      error.status = 404;
      throw error;
    }
  }
}

module.exports = {
  RemoveFromBlacklistUseCase,
};

