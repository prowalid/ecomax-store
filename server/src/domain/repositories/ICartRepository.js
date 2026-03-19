const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class ICartRepository extends BaseRepositoryContract {
  async findBySessionId() { this.notImplemented('findBySessionId'); }
  async findMatchingItem() { this.notImplemented('findMatchingItem'); }
  async createItem() { this.notImplemented('createItem'); }
  async updateQuantityById() { this.notImplemented('updateQuantityById'); }
  async updateQuantityByIdAndSessionId() { this.notImplemented('updateQuantityByIdAndSessionId'); }
  async deleteByIdAndSessionId() { this.notImplemented('deleteByIdAndSessionId'); }
  async clearBySessionId() { this.notImplemented('clearBySessionId'); }
}

module.exports = { ICartRepository };
