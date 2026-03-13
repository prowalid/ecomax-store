const express = require('express');
const router = express.Router();
const { getBlacklist, addToBlacklist, removeFromBlacklist } = require('../controllers/blacklistController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getBlacklist);
router.post('/', addToBlacklist);
router.delete('/:id', removeFromBlacklist);

module.exports = router;
