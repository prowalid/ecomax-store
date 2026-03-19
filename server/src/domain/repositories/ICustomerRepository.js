const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class ICustomerRepository extends BaseRepositoryContract {
  async findAll() { this.notImplemented('findAll'); }
  async findByPhone() { this.notImplemented('findByPhone'); }
  async create() { this.notImplemented('create'); }
  async update() { this.notImplemented('update'); }
}

module.exports = { ICustomerRepository };
