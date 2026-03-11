const express = require('express');
const router = express.Router();
const { getCustomers, createOrUpdateCustomer } = require('../controllers/customersController');
const authMiddleware = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createCustomerSchema } = require('../validators/customerSchemas');

// Public route for storefront checkout to save customer info
router.post('/', validateBody(createCustomerSchema), createOrUpdateCustomer);

// Protected route for Admin Dashboard
router.use(authMiddleware);
router.get('/', getCustomers);

module.exports = router;
