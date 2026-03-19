const express = require('express');
const { getBlacklist, addToBlacklist, removeFromBlacklist } = require('../controllers/BlacklistController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getBlacklist);
router.post('/', addToBlacklist);
router.delete('/:id', removeFromBlacklist);

module.exports = router;
