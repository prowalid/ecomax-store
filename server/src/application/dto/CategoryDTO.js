class CategoryDTO {
  static from(category) {
    if (!category) {
      return null;
    }

    return {
      id: category.id ?? null,
      name: category.name ?? '',
      slug: category.slug ?? null,
      sort_order: Number(category.sort_order ?? 0),
      image_url: category.image_url ?? null,
      version: Number(category.version ?? 1),
    };
  }
}

module.exports = {
  CategoryDTO,
};
