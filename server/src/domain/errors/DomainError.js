class DomainError extends Error {
  constructor(message, { code = 'DOMAIN_ERROR', statusCode = 400, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.status = statusCode;
    this.isOperational = true;

    if (details !== undefined) {
      this.details = details;
    }
  }
}

module.exports = {
  DomainError,
};
