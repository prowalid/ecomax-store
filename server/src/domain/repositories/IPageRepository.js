const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IPageRepository extends BaseRepositoryContract {
  async findAll() { this.notImplemented('findAll'); }
  async findPublishedByPlacement() { this.notImplemented('findPublishedByPlacement'); }
  async findPublishedBySlug() { this.notImplemented('findPublishedBySlug'); }
  async findBySlug() { this.notImplemented('findBySlug'); }
  async findBySlugExcludingId() { this.notImplemented('findBySlugExcludingId'); }
  async create() { this.notImplemented('create'); }
  async update() { this.notImplemented('update'); }
  async delete() { this.notImplemented('delete'); }
}

module.exports = { IPageRepository };
