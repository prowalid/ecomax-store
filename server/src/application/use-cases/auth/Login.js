const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const otplib = require('otplib');
const { Phone } = require('../../../domain/value-objects/Phone');
const { ValidationError } = require('../../../domain/errors/ValidationError');
const { AuthenticationError } = require('../../../domain/errors/AuthenticationError');

class LoginUseCase {
  constructor({ userRepository, authTokenService, authSessionService }) {
    this.userRepository = userRepository;
    this.authTokenService = authTokenService;
    this.authSessionService = authSessionService;
  }

  async execute({ phone, password, twoFactorCode, requestMeta }) {
    if (!password) {
      throw new ValidationError('Phone and password are required.');
    }

    const normalizedPhone = new Phone(phone).value;

    const user = await this.userRepository.findAuthByPhone(normalizedPhone);
    if (!user) {
      throw new AuthenticationError('Invalid phone or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid phone or password.');
    }

    if (user.two_factor_enabled) {
      if (!twoFactorCode) {
        throw new AuthenticationError('Two-factor authentication code required.', {
          statusCode: 403,
          requires2FA: true,
        });
      }

      const isValid2FA = otplib.authenticator.check(twoFactorCode, user.two_factor_secret);
      if (!isValid2FA) {
        throw new AuthenticationError('Invalid two-factor authentication code.');
      }
    }

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
      accessToken,
      refreshToken,
      ttl,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        two_factor_enabled: user.two_factor_enabled,
      },
    };
  }
}

module.exports = {
  LoginUseCase,
};
