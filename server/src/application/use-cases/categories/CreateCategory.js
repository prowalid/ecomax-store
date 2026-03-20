const { Slug } = require('../../../domain/value-objects/Slug');
const { ConflictError } = require('../../../domain/errors/ConflictError');
const { Category } = require('../../../domain/entities/Category');
const { buildUniqueSlug } = require('../../../utils/buildUniqueSlug');

class CreateCategoryUseCase {
  constructor({ categoryRepository, cacheService }) {
    this.categoryRepository = categoryRepository;
    this.cacheService = cacheService;
  }

  async execute({ name, slug, sort_order = 0, image_url = null }) {
    const categoryDraft = new Category({
      name,
      slug,
      sort_order,
      image_url,
    });
    let normalizedSlug = categoryDraft.slug;

    if (!normalizedSlug) {
      normalizedSlug = await buildUniqueSlug(name, async (candidate) => {
        const existingCategory = await this.categoryRepository.findBySlug(candidate);
        return Boolean(existingCategory);
      }, 'category');
    }

    if (normalizedSlug) {
      const existingCategory = await this.categoryRepository.findBySlug(normalizedSlug);
      if (existingCategory) {
        throw new ConflictError('Category slug already exists');
      }
    }

    const category = await this.categoryRepository.create(
      new Category({
        ...categoryDraft.toPersistence(),
        slug: normalizedSlug,
      })
    );

    await this.cacheService.invalidateByPrefix('categories:');
    return category;
  }
}

module.exports = {
  CreateCategoryUseCase,
};
