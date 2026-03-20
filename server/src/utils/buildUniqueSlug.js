const { Slug } = require('../domain/value-objects/Slug');

async function buildUniqueSlug(value, exists) {
  const baseSlug = new Slug(value || 'product').value || 'product';
  let candidate = baseSlug;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

module.exports = {
  buildUniqueSlug,
};
