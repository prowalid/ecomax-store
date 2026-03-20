const { ValidationError } = require('../errors/ValidationError');

class Slug {
  constructor(value, { required = true } = {}) {
    const normalized = Slug.normalize(value);

    if (required && !normalized) {
      throw new ValidationError('Slug is required');
    }

    this.value = normalized;
    Object.freeze(this);
  }

  static normalize(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  static optional(value) {
    return new Slug(value, { required: false }).value || null;
  }

  toString() {
    return this.value;
  }
}

module.exports = {
  Slug,
};
