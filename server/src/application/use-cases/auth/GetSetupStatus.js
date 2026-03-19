class GetSetupStatusUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute() {
    const count = await this.userRepository.countAll();
    return { hasAdmin: count > 0 };
  }
}

module.exports = {
  GetSetupStatusUseCase,
};

