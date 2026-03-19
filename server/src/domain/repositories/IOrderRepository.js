const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IOrderRepository extends BaseRepositoryContract {
  async listAll() { this.notImplemented('listAll'); }
  async findById() { this.notImplemented('findById'); }
  async findItemsByOrderId() { this.notImplemented('findItemsByOrderId'); }
  async findAllItemsByOrderId() { this.notImplemented('findAllItemsByOrderId'); }
  async withTransaction() { this.notImplemented('withTransaction'); }
  async getStatusSnapshot() { this.notImplemented('getStatusSnapshot'); }
  async lockProducts() { this.notImplemented('lockProducts'); }
  async calculateOrderDraft() { this.notImplemented('calculateOrderDraft'); }
  async createOrder() { this.notImplemented('createOrder'); }
  async insertOrderItems() { this.notImplemented('insertOrderItems'); }
  async adjustStock() { this.notImplemented('adjustStock'); }
  async updateStatus() { this.notImplemented('updateStatus'); }
  async getOrderItems() { this.notImplemented('getOrderItems'); }
  async getDetailedOrderItems() { this.notImplemented('getDetailedOrderItems'); }
  async updateShipmentInfo() { this.notImplemented('updateShipmentInfo'); }
}

module.exports = { IOrderRepository };
