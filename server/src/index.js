require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const pagesRoutes = require('./routes/pages');
const customersRoutes = require('./routes/customers');
const discountsRoutes = require('./routes/discounts');
const cartRoutes = require('./routes/cart');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');
const integrationsRoutes = require('./routes/integrations');
const path = require('path');
const pool = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/discounts', discountsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/integrations', integrationsRoutes);

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

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Start ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Express Trade Kit API running on http://0.0.0.0:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth\n`);
});
