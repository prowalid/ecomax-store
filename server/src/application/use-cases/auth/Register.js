const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { User } = require('../../../domain/entities/User');
const { Password } = require('../../../domain/value-objects/Password');
const { ValidationError } = require('../../../domain/errors/ValidationError');
const { AuthenticationError } = require('../../../domain/errors/AuthenticationError');

class RegisterUseCase {
  constructor({ userRepository, authTokenService, authSessionService }) {
    this.userRepository = userRepository;
    this.authTokenService = authTokenService;
    this.authSessionService = authSessionService;
  }

  async execute({ name, phone, password, requestMeta }) {
    if (!name || !phone || !password) {
      throw new ValidationError('Name, phone, and password are required.');
    }

    const passwordValue = new Password(password);
    const userDraft = new User({ name, phone, role: 'admin' });

    const userCount = await this.userRepository.countAll();
    if (userCount > 0) {
      throw new AuthenticationError('Registration is closed. An admin already exists.', {
        statusCode: 403,
        code: 'REGISTRATION_CLOSED',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(passwordValue.value, salt);

    const user = await this.userRepository.createAdmin({
      ...userDraft.toPersistence(),
      passwordHash,
    });

    const provisionalSessionId = randomUUID();
    const { accessToken, refreshToken, ttl } = this.authTokenService.issue(user, provisionalSessionId);

    await this.authSessionService.create({
      userId: user.id,
      refreshToken,
      refreshTtlSeconds: ttl.refreshSeconds,
      ...requestMeta,
      sessionId: provisionalSessionId,
    });

    return {
      message: 'Admin account created successfully.',
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      accessToken,
      refreshToken,
      ttl,
    };
  }
}

module.exports = {
  RegisterUseCase,
};
