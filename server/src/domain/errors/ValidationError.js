const { DomainError } = require('./DomainError');

class ValidationError extends DomainError {
  constructor(message, details) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
    });
  }
}

module.exports = {
  ValidationError,
};
