const { CategoryDTO } = require('../../application/dto');
const { recordAdminAudit } = require('./audit');

async function getCategories(req, res, next) {
  try {
    const getCategoriesUseCase = req.app.locals.container?.resolve('getCategoriesUseCase');
    const categories = await getCategoriesUseCase.execute();
    res.json(Array.isArray(categories) ? categories.map((category) => CategoryDTO.from(category)) : categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const createCategoryUseCase = req.app.locals.container?.resolve('createCategoryUseCase');
    const category = await createCategoryUseCase.execute(req.body);
    await recordAdminAudit(req, {
      action: 'category.create',
      entityType: 'category',
      entityId: category.id,
      meta: { name: category.name, slug: category.slug },
    });
    res.status(201).json(CategoryDTO.from(category));
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  const { id } = req.params;
  try {
    const updateCategoryUseCase = req.app.locals.container?.resolve('updateCategoryUseCase');
    const uploadCleanupService = req.app.locals.container?.resolve('uploadCleanupService');
    const { previousImageUrl, updatedCategory } = await updateCategoryUseCase.execute({
      id,
      updates: req.body,
    });

    await uploadCleanupService.cleanupRemovedUploadUrls([previousImageUrl], [updatedCategory.image_url]);
    await recordAdminAudit(req, {
      action: 'category.update',
      entityType: 'category',
      entityId: updatedCategory.id,
      meta: { name: updatedCategory.name, slug: updatedCategory.slug },
    });
    res.json(CategoryDTO.from(updatedCategory));
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  const { id } = req.params;
  try {
    const deleteCategoryUseCase = req.app.locals.container?.resolve('deleteCategoryUseCase');
    const uploadCleanupService = req.app.locals.container?.resolve('uploadCleanupService');
    const { deletedImageUrl } = await deleteCategoryUseCase.execute({ id });
    await uploadCleanupService.cleanupRemovedUploadUrls([deletedImageUrl], []);

    await recordAdminAudit(req, {
      action: 'category.delete',
      entityType: 'category',
      entityId: id,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
