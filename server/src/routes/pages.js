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

// Public endpoints for the storefront
router.get('/published/:placement', getPublishedPages);
router.get('/slug/:slug', getPageBySlug);

// Protected endpoints for the admin dashboard
router.use(authMiddleware);

router.get('/', getAllPages);
router.post('/', createPage);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);

module.exports = router;
