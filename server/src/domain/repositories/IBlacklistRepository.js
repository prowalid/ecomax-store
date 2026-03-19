const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IBlacklistRepository extends BaseRepositoryContract {
  async findMatches() { this.notImplemented('findMatches'); }
  async findAll() { this.notImplemented('findAll'); }
  async upsert() { this.notImplemented('upsert'); }
  async deleteById() { this.notImplemented('deleteById'); }
}

module.exports = { IBlacklistRepository };
