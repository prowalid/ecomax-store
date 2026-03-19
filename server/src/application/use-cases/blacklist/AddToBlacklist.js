class AddToBlacklistUseCase {
  constructor({ blacklistRepository }) {
    this.blacklistRepository = blacklistRepository;
  }

  async execute({ type, value, reason }) {
    if (!type || !value) {
      const error = new Error('Type and value are required');
      error.status = 400;
      throw error;
    }

    if (!['phone', 'ip'].includes(type)) {
      const error = new Error('Invalid type. Must be phone or ip');
      error.status = 400;
      throw error;
    }

    return this.blacklistRepository.upsert({ type, value, reason });
  }
}

module.exports = {
  AddToBlacklistUseCase,
};

