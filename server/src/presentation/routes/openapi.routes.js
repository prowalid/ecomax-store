const express = require('express');
const { getOpenApiSpec } = require('../controllers/OpenApiController');

const router = express.Router();

router.get('/openapi.json', getOpenApiSpec);

module.exports = router;
