const { Slug } = require('../../../domain/value-objects/Slug');
const { ValidationError } = require('../../../domain/errors/ValidationError');
const { ConflictError } = require('../../../domain/errors/ConflictError');
const { NotFoundError } = require('../../../domain/errors/NotFoundError');
const { Category } = require('../../../domain/entities/Category');
const { buildUniqueSlug } = require('../../../utils/buildUniqueSlug');

class UpdateCategoryUseCase {
  constructor({ categoryRepository, cacheService }) {
    this.categoryRepository = categoryRepository;
    this.cacheService = cacheService;
  }

  async execute({ id, updates }) {
    const { version, ...rawUpdates } = updates;

    if (!Number.isInteger(version) || version < 1) {
      throw new ValidationError('Version is required');
    }

    if (Object.keys(rawUpdates).length === 0) {
      throw new ValidationError('No fields to update');
    }

    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    const nextUpdates = { ...rawUpdates };
    if (nextUpdates.slug !== undefined) {
      nextUpdates.slug = Slug.optional(nextUpdates.slug);

      if (nextUpdates.slug) {
        const conflictingCategory = await this.categoryRepository.findBySlugExcludingId(nextUpdates.slug, id);
        if (conflictingCategory) {
          throw new ConflictError('Category slug already exists');
        }
      }
    } else if ((!existingCategory.slug || !String(existingCategory.slug).trim()) && nextUpdates.name) {
      nextUpdates.slug = await buildUniqueSlug(nextUpdates.name, async (candidate) => {
        const conflictingCategory = await this.categoryRepository.findBySlugExcludingId(candidate, id);
        return Boolean(conflictingCategory);
      }, 'category');
    }

    const updatedCategory = await this.categoryRepository.update(
      id,
      new Category(existingCategory).applyUpdates(nextUpdates),
      version
    );
    if (updatedCategory?.type === 'invalid') {
      throw new ValidationError('No valid fields to update');
    }

    await this.cacheService.invalidateByPrefix('categories:');

    return {
      previousImageUrl: existingCategory.image_url,
      updatedCategory,
    };
  }
}

module.exports = {
  UpdateCategoryUseCase,
};
