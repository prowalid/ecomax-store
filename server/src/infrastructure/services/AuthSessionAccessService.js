const pool = require('../../config/db');
const { PgAuthSessionRepository } = require('../repositories/PgAuthSessionRepository');

const repository = new PgAuthSessionRepository(pool);

async function ensureAuthSessionsTable() {
  return repository.ensureTable();
}

async function isAuthSessionActive(sessionId) {
  return repository.isActive(sessionId);
}

module.exports = {
  ensureAuthSessionsTable,
  isAuthSessionActive,
};
