const { Slug } = require('../value-objects/Slug');
const { ValidationError } = require('../errors/ValidationError');

const ALLOWED_SHOW_IN = new Set(['none', 'header', 'footer', 'both']);

function normalizeText(value) {
  return value == null ? null : String(value).trim();
}

class Page {
  constructor(data) {
    const title = normalizeText(data.title);
    if (!title) {
      throw new ValidationError('Title and slug are required');
    }

    const slug = new Slug(data.slug).value;
    const showIn = normalizeText(data.show_in) || 'none';
    if (!ALLOWED_SHOW_IN.has(showIn)) {
      throw new ValidationError('Invalid page placement');
    }

    this.id = data.id || null;
    this.title = title;
    this.slug = slug;
    this.content = data.content == null ? '' : String(data.content);
    this.published = Boolean(data.published);
    this.show_in = showIn;
  }

  applyUpdates(updates) {
    return new Page({
      ...this.toPersistence(),
      ...updates,
    });
  }

  toPersistence() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      content: this.content,
      published: this.published,
      show_in: this.show_in,
    };
  }
}

module.exports = {
  Page,
};
