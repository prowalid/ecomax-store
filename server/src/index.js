require('dotenv').config();

const { createApp } = require('./app');
const { createContainer } = require('./container');
const { ensureAuthSessionsTable } = require('./infrastructure/services/AuthSessionAccessService');
const { validateRuntimeEnv } = require('./config/runtime');
const PORT = process.env.PORT || 3001;

// ─── Start ───
async function startServer() {
  const runtime = validateRuntimeEnv();
  runtime.warnings.forEach((warning) => {
    console.warn(`⚠️ ${warning}`);
  });

  const container = createContainer();
  const app = createApp(container);

  await ensureAuthSessionsTable();
  await container.resolve('ensureStartupSchemaUseCase').execute();
  await container.resolve('ensureDefaultCategoryImagesUseCase').execute();
  await container.resolve('ensurePagesSlugIntegrityUseCase').execute();
  await container.resolve('queueManager').start();
  container.resolve('startCartCleanupUseCase').execute();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Express Trade Kit API running on http://0.0.0.0:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Auth:   http://localhost:${PORT}/api/auth\n`);
    console.log('   Runtime:', runtime.summary);
  });

  const shutdown = async () => {
    await container.resolve('queueManager').shutdown();
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
