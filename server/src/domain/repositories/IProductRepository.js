const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IProductRepository extends BaseRepositoryContract {
  async list() { this.notImplemented('list'); }
  async create() { this.notImplemented('create'); }
  async getImageSnapshot() { this.notImplemented('getImageSnapshot'); }
  async update() { this.notImplemented('update'); }
  async getDeleteSnapshot() { this.notImplemented('getDeleteSnapshot'); }
  async delete() { this.notImplemented('delete'); }
  async listImages() { this.notImplemented('listImages'); }
  async addImage() { this.notImplemented('addImage'); }
  async reorderImages() { this.notImplemented('reorderImages'); }
  async deleteImage() { this.notImplemented('deleteImage'); }
}

module.exports = { IProductRepository };
