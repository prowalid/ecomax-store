const { Slug } = require('../value-objects/Slug');
const { ValidationError } = require('../errors/ValidationError');

function normalizeText(value) {
  return value == null ? null : String(value).trim();
}

class Category {
  constructor(data) {
    const name = normalizeText(data.name);
    if (!name) {
      throw new ValidationError('Name is required');
    }

    const sortOrder = Number(data.sort_order ?? 0);
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      throw new ValidationError('Sort order must be a non-negative number');
    }

    this.id = data.id || null;
    this.name = name;
    this.slug = data.slug === undefined ? null : Slug.optional(data.slug);
    this.sort_order = sortOrder;
    this.image_url = normalizeText(data.image_url) || null;
  }

  applyUpdates(updates) {
    return new Category({
      ...this.toPersistence(),
      ...updates,
    });
  }

  toPersistence() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      sort_order: this.sort_order,
      image_url: this.image_url,
    };
  }
}

module.exports = {
  Category,
};
