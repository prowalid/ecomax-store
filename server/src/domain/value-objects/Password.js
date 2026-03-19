const { ValidationError } = require('../errors/ValidationError');

class Password {
  constructor(value) {
    const normalized = String(value || '');
    if (normalized.length < 6) {
      throw new ValidationError('Password must be at least 6 characters.');
    }

    this.value = normalized;
    Object.freeze(this);
  }
}

module.exports = {
  Password,
};
