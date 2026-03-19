class GetProfileUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return profile;
  }
}

module.exports = {
  GetProfileUseCase,
};

