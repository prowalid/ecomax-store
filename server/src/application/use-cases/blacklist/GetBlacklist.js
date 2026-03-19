class GetBlacklistUseCase {
  constructor({ blacklistRepository }) {
    this.blacklistRepository = blacklistRepository;
  }

  async execute() {
    return this.blacklistRepository.findAll();
  }
}

module.exports = {
  GetBlacklistUseCase,
};

