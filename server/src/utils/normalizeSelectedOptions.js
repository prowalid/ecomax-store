function normalizeSelectedOptions(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};

  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [String(key).trim(), typeof value === 'string' ? value.trim() : ''])
      .filter(([key, value]) => key && value)
  );
}

module.exports = { normalizeSelectedOptions };
