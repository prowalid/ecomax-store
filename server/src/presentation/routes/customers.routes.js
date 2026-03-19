const express = require('express');
const { getCustomers, createOrUpdateCustomer } = require('../controllers/CustomersController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createSanitizeBody } = require('../middleware/sanitize');
const { createCustomerSchema } = require('../validators/customerSchemas');

const router = express.Router();

router.post('/', createSanitizeBody(), validateBody(createCustomerSchema), createOrUpdateCustomer);

router.use(authMiddleware);
router.get('/', getCustomers);

module.exports = router;
