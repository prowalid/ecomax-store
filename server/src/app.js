const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { requestContext } = require('./presentation/middleware/requestContext');
const { requestLogging } = require('./presentation/middleware/requestLogging');
const { createMetricsMiddleware } = require('./presentation/middleware/metrics');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./presentation/openapi/openapi.json');

const {
  authRoutes,
  productsRoutes,
  ordersRoutes,
  healthRoutes,
  metricsRoutes,
  openApiRoutes,
  categoriesRoutes,
  pagesRoutes,
  customersRoutes,
  cartRoutes,
  settingsRoutes,
  uploadRoutes,
  integrationsRoutes,
  analyticsRoutes,
  blacklistRoutes,
} = require('./presentation/routes');

function parseCorsOrigins(rawOrigins) {
  return (rawOrigins || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createApp(container) {
  const app = express();
  app.locals.container = container;
  const logger = container.resolve('logger');
  const { errorHandler } = container.resolve('errorHandler');
  const fileStorage = container.resolve('fileStorage');
  const trustProxy = process.env.TRUST_PROXY;
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

  if (trustProxy) {
    app.set('trust proxy', trustProxy === 'true' ? 1 : trustProxy);
  }

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed for this origin'));
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(requestContext);
  app.use(fileStorage.getPublicPrefix(), express.static(fileStorage.getUploadsDir()));
  app.use(requestLogging);
  app.use(createMetricsMiddleware({ metricsService: container.resolve('metricsService') }));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/pages', pagesRoutes);
  app.use('/api/customers', customersRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/integrations', integrationsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/blacklist', blacklistRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api', openApiRoutes);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
