require('dotenv').config();

const pool = require('./src/config/db');
const { SchemaMigrationService } = require('./src/infrastructure/services/SchemaMigrationService');

async function run() {
  const command = process.argv[2] || 'up';
  const service = new SchemaMigrationService({ pool });

  try {
    if (command === 'up') {
      await service.runPendingMigrations();
      await service.ensureAppearanceSettingsShape();
      console.log('Migrations applied successfully');
      return;
    }

    if (command === 'down') {
      const rolledBack = await service.rollbackLastMigration();
      console.log(rolledBack ? `Rolled back migration: ${rolledBack}` : 'No migrations to roll back');
      return;
    }

    throw new Error(`Unsupported migrate command: ${command}`);
  } catch (error) {
    console.error('Migration command failed', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
