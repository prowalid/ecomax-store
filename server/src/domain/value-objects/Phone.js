const { ValidationError } = require('../errors/ValidationError');

class Phone {
  constructor(value) {
    const normalized = Phone.normalize(value);
    if (!normalized) {
      throw new ValidationError('Phone and password are required.');
    }

    this.value = normalized;
    Object.freeze(this);
  }

  static normalize(value) {
    return String(value || '').replace(/\D/g, '').trim();
  }

  toString() {
    return this.value;
  }
}

module.exports = {
  Phone,
};
