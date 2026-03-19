const express = require('express');
const {
  getHealth,
  getLive,
  getReady,
  getVersion,
  getMetrics,
} = require('../controllers/HealthController');

const healthRouter = express.Router();
const metricsRouter = express.Router();

healthRouter.get('/', getHealth);
healthRouter.get('/live', getLive);
healthRouter.get('/ready', getReady);
healthRouter.get('/version', getVersion);

metricsRouter.get('/', getMetrics);

module.exports = {
  healthRoutes: healthRouter,
  metricsRoutes: metricsRouter,
};
