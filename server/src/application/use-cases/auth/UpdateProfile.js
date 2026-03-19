const { User } = require('../../../domain/entities/User');

class UpdateProfileUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId, name, phone }) {
    const userDraft = new User({
      name,
      phone,
      role: 'admin',
    });

    return this.userRepository.updateProfile(userId, userDraft);
  }
}

module.exports = {
  UpdateProfileUseCase,
};
