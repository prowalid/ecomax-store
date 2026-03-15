require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const pagesRoutes = require('./routes/pages');
const customersRoutes = require('./routes/customers');
const cartRoutes = require('./routes/cart');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');
const integrationsRoutes = require('./routes/integrations');
const analyticsRoutes = require('./routes/analytics');
const blacklistRoutes = require('./routes/blacklist');
const path = require('path');
const helmet = require('helmet');
const pool = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { ensureAuthSessionsTable } = require('./utils/authSessions');
const { ensureDefaultCategoryImages } = require('./utils/categoryDefaults');
const { ensurePagesSlugIntegrity } = require('./utils/pagesIntegrity');
const { ensureOrderSecuritySchema, ensureUserAccountSchema } = require('./utils/schemaMigrations');
const { startCartCleanupJob } = require('./utils/cartCleanup');
const { getVersionPayload } = require('./utils/versionInfo');

const app = express();
const PORT = process.env.PORT || 3001;
const trustProxy = process.env.TRUST_PROXY;

if (trustProxy) {
  app.set('trust proxy', trustProxy === 'true' ? 1 : trustProxy);
}

// ─── Middleware ───
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ─── Security Headers (Helmet) ───
app.use(helmet({
  contentSecurityPolicy: false,   // Disable CSP for now (SPA serves its own scripts)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to load cross-origin
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// HTTP Request logging with Morgan
app.use(morgan('combined', { stream: logger.stream }));

// ─── Routes ───
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

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      time: result.rows[0].now,
      database: 'connected',
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/health/version', (req, res) => {
  res.json(getVersionPayload());
});

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Start ───
async function startServer() {
  await ensureAuthSessionsTable();
  await ensureUserAccountSchema();
  await ensureOrderSecuritySchema();
  await ensureDefaultCategoryImages();
  await ensurePagesSlugIntegrity();
  startCartCleanupJob();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Express Trade Kit API running on http://0.0.0.0:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Auth:   http://localhost:${PORT}/api/auth\n`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
