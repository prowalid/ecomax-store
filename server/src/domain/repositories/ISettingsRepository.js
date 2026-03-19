const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class ISettingsRepository extends BaseRepositoryContract {
  async findValuesByKeys() { this.notImplemented('findValuesByKeys'); }
  async findValueByKey() { this.notImplemented('findValueByKey'); }
  async saveMerged() { this.notImplemented('saveMerged'); }
  async saveValue() { this.notImplemented('saveValue'); }
}

module.exports = { ISettingsRepository };
