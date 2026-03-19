const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getAnalytics, getAdminAuditLog } = require('../controllers/AnalyticsController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAnalytics);
router.get('/audit-log', getAdminAuditLog);

module.exports = router;
