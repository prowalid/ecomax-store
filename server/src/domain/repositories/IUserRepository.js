const { BaseRepositoryContract } = require('./BaseRepositoryContract');

class IUserRepository extends BaseRepositoryContract {
  async countAll() { this.notImplemented('countAll'); }
  async findPublicById() { this.notImplemented('findPublicById'); }
  async findProfileById() { this.notImplemented('findProfileById'); }
  async findAuthByPhone() { this.notImplemented('findAuthByPhone'); }
  async createAdmin() { this.notImplemented('createAdmin'); }
  async findPasswordHashById() { this.notImplemented('findPasswordHashById'); }
  async updatePassword() { this.notImplemented('updatePassword'); }
  async findNameAndPhoneById() { this.notImplemented('findNameAndPhoneById'); }
  async setTwoFactorSecret() { this.notImplemented('setTwoFactorSecret'); }
  async enableTwoFactor() { this.notImplemented('enableTwoFactor'); }
  async disableTwoFactor() { this.notImplemented('disableTwoFactor'); }
  async savePasswordRecoveryCode() { this.notImplemented('savePasswordRecoveryCode'); }
  async findByRecoveryCode() { this.notImplemented('findByRecoveryCode'); }
  async clearPasswordRecoveryCode() { this.notImplemented('clearPasswordRecoveryCode'); }
  async updateProfile() { this.notImplemented('updateProfile'); }
}

module.exports = { IUserRepository };
