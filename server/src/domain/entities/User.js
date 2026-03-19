const { Phone } = require('../value-objects/Phone');
const { ValidationError } = require('../errors/ValidationError');

function normalizeText(value) {
  return value == null ? null : String(value).trim();
}

class User {
  constructor(data) {
    const name = normalizeText(data.name);
    if (!name) {
      throw new ValidationError('Name is required.');
    }

    const phone = new Phone(data.phone).value;

    this.id = data.id || null;
    this.name = name;
    this.phone = phone;
    this.role = normalizeText(data.role) || 'admin';
    this.two_factor_enabled = Boolean(data.two_factor_enabled);
    this.email = normalizeText(data.email) || User.buildInternalEmail(phone);
  }

  static buildInternalEmail(phone) {
    return `admin-${new Phone(phone).value}@internal.etk`;
  }

  applyProfileUpdates(updates) {
    return new User({
      ...this.toPersistence(),
      ...updates,
      role: this.role,
      two_factor_enabled: this.two_factor_enabled,
    });
  }

  toPersistence() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      role: this.role,
      two_factor_enabled: this.two_factor_enabled,
    };
  }
}

module.exports = {
  User,
};
