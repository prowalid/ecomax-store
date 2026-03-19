const { PageDTO } = require('../../application/dto');
const { recordAdminAudit } = require('./audit');

async function getAllPages(req, res, next) {
  try {
    const getAllPagesUseCase = req.app.locals.container?.resolve('getAllPagesUseCase');
    const pages = await getAllPagesUseCase.execute();
    res.json(Array.isArray(pages) ? pages.map((page) => PageDTO.from(page)) : pages);
  } catch (err) {
    next(err);
  }
}

async function getPublishedPages(req, res, next) {
  const { placement } = req.params;
  try {
    const getPublishedPagesUseCase = req.app.locals.container?.resolve('getPublishedPagesUseCase');
    const pages = await getPublishedPagesUseCase.execute({ placement });
    res.json(Array.isArray(pages) ? pages.map((page) => PageDTO.from(page)) : pages);
  } catch (err) {
    next(err);
  }
}

async function getPageBySlug(req, res, next) {
  try {
    const getPageBySlugUseCase = req.app.locals.container?.resolve('getPageBySlugUseCase');
    const page = await getPageBySlugUseCase.execute({ slug: req.params.slug });
    res.json(PageDTO.from(page));
  } catch (err) {
    next(err);
  }
}

async function createPage(req, res, next) {
  try {
    const createPageUseCase = req.app.locals.container?.resolve('createPageUseCase');
    const page = await createPageUseCase.execute(req.body);
    await recordAdminAudit(req, {
      action: 'page.create',
      entityType: 'page',
      entityId: page.id,
      meta: { slug: page.slug, published: page.published },
    });
    res.status(201).json(PageDTO.from(page));
  } catch (err) {
    next(err);
  }
}

async function updatePage(req, res, next) {
  const { id } = req.params;
  try {
    const updatePageUseCase = req.app.locals.container?.resolve('updatePageUseCase');
    const page = await updatePageUseCase.execute({ id, updates: req.body });
    await recordAdminAudit(req, {
      action: 'page.update',
      entityType: 'page',
      entityId: page.id,
      meta: { slug: page.slug, published: page.published },
    });
    res.json(PageDTO.from(page));
  } catch (err) {
    next(err);
  }
}

async function deletePage(req, res, next) {
    const { id } = req.params;
    try {
      const deletePageUseCase = req.app.locals.container?.resolve('deletePageUseCase');
      await deletePageUseCase.execute({ id });
      await recordAdminAudit(req, {
        action: 'page.delete',
        entityType: 'page',
        entityId: id,
      });
      res.status(204).send();
    } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllPages,
  getPublishedPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
};
