function normalizeCustomOptions(input) {
  if (!Array.isArray(input)) return [];

  return input
    .map((group) => {
      if (!group || typeof group !== 'object') return null;

      const name = typeof group.name === 'string' ? group.name.trim() : '';
      const values = Array.isArray(group.values)
        ? group.values
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
        : [];

      if (!name || values.length === 0) return null;

      return {
        name,
        values: Array.from(new Set(values)),
      };
    })
    .filter(Boolean);
}

module.exports = {
  normalizeCustomOptions,
};
