const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getAnalytics } = require('../controllers/analyticsController');

router.use(authMiddleware);
router.get('/', getAnalytics);

module.exports = router;
