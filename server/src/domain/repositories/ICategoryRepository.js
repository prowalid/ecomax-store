const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class ICategoryRepository extends BaseRepositoryContract {
  async findAll() { this.notImplemented('findAll'); }
  async findBySlug() { this.notImplemented('findBySlug'); }
  async findBySlugExcludingId() { this.notImplemented('findBySlugExcludingId'); }
  async findById() { this.notImplemented('findById'); }
  async create() { this.notImplemented('create'); }
  async update() { this.notImplemented('update'); }
  async delete() { this.notImplemented('delete'); }
}

module.exports = { ICategoryRepository };
