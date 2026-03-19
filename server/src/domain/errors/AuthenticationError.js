const { DomainError } = require('./DomainError');

class AuthenticationError extends DomainError {
  constructor(message = 'Authentication failed.', options = {}) {
    super(message, {
      code: options.code || 'AUTHENTICATION_ERROR',
      statusCode: options.statusCode || 401,
      details: options.details,
    });

    if (options.requires2FA) {
      this.requires_2fa = true;
    }
  }
}

module.exports = {
  AuthenticationError,
};
