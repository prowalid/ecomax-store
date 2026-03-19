const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IAuthSessionRepository extends BaseRepositoryContract {
  async ensureTable() { this.notImplemented('ensureTable'); }
  async create() { this.notImplemented('create'); }
  async findById() { this.notImplemented('findById'); }
  async isActive() { this.notImplemented('isActive'); }
  async findActiveByRefreshToken() { this.notImplemented('findActiveByRefreshToken'); }
  async touch() { this.notImplemented('touch'); }
  async revokeById() { this.notImplemented('revokeById'); }
  async revokeByUserId() { this.notImplemented('revokeByUserId'); }
  async revokeByRefreshToken() { this.notImplemented('revokeByRefreshToken'); }
  async cleanupExpired() { this.notImplemented('cleanupExpired'); }
}

module.exports = { IAuthSessionRepository };
