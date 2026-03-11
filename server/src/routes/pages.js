const express = require('express');
const router = express.Router();
const { 
  getAllPages, 
  getPublishedPages, 
  getPageBySlug, 
  createPage, 
  updatePage, 
  deletePage 
} = require('../controllers/pagesController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createPageSchema, updatePageSchema } = require('../validators/pageSchemas');

// Public endpoints for the storefront
router.get('/published/:placement', getPublishedPages);
router.get('/slug/:slug', getPageBySlug);

// Protected endpoints for the admin dashboard
router.use(authMiddleware);

router.get('/', getAllPages);
router.post('/', validateBody(createPageSchema), createPage);
router.patch('/:id', validateBody(updatePageSchema), updatePage);
router.delete('/:id', deletePage);

module.exports = router;
