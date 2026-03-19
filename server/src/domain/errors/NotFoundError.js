const { DomainError } = require('./DomainError');

class NotFoundError extends DomainError {
  constructor(message = 'Resource not found.', options = {}) {
    super(message, {
      code: options.code || 'NOT_FOUND',
      statusCode: options.statusCode || 404,
      details: options.details,
    });
  }
}

module.exports = {
  NotFoundError,
};
