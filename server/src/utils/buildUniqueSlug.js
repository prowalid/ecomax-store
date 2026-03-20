const { Slug } = require('../domain/value-objects/Slug');

function buildSlugSeed(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function buildUniqueSlug(value, exists, fallbackSeed) {
  const normalizedValue = buildSlugSeed(value);
  const normalizedFallback = buildSlugSeed(fallbackSeed);
  const seed = normalizedValue || normalizedFallback;
  const baseSlug = new Slug(seed || 'product').value || 'product';
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
