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
const { createPageSchema, updatePageSchema } = require('../validators/pageSchemas');

const router = express.Router();

router.get('/published/:placement', getPublishedPages);
router.get('/slug/:slug', getPageBySlug);

router.use(authMiddleware);
router.get('/', getAllPages);
router.post('/', validateBody(createPageSchema), createPage);
router.patch('/:id', validateBody(updatePageSchema), updatePage);
router.delete('/:id', deletePage);

module.exports = router;
