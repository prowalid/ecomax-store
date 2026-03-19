const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getAnalytics } = require('../controllers/AnalyticsController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAnalytics);

module.exports = router;
