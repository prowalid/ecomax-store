const { DomainError } = require('./DomainError');

class ConflictError extends DomainError {
  constructor(message = 'Conflict detected.', options = {}) {
    super(message, {
      code: options.code || 'CONFLICT',
      statusCode: options.statusCode || 409,
      details: options.details,
    });
  }
}

module.exports = {
  ConflictError,
};
