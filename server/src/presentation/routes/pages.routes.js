const express = require('express');
const {
  getAllPages,
  getPublishedPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
} = require('../controllers/PagesController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createSanitizeBody } = require('../middleware/sanitize');
const { createPageSchema, updatePageSchema } = require('../validators/pageSchemas');

const router = express.Router();

router.get('/published/:placement', getPublishedPages);
router.get('/slug/:slug', getPageBySlug);

router.use(authMiddleware);
router.get('/', getAllPages);
router.post('/', createSanitizeBody({ allowHtmlPaths: ['content'] }), validateBody(createPageSchema), createPage);
router.patch('/:id', createSanitizeBody({ allowHtmlPaths: ['content'] }), validateBody(updatePageSchema), updatePage);
router.delete('/:id', deletePage);

module.exports = router;
