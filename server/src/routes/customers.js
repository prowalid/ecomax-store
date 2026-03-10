const express = require('express');
const router = express.Router();
const { getCustomers, createOrUpdateCustomer } = require('../controllers/customersController');
const authMiddleware = require('../middleware/auth');

// Public route for storefront checkout to save customer info
router.post('/', createOrUpdateCustomer);

// Protected route for Admin Dashboard
router.use(authMiddleware);
router.get('/', getCustomers);

module.exports = router;
