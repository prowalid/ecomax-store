const otplib = require('otplib');
const qrcode = require('qrcode');

class SetupTwoFactorUseCase {
  constructor({ userRepository, settingsRepository }) {
    this.userRepository = userRepository;
    this.settingsRepository = settingsRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findNameAndPhoneById(userId);
    const secret = otplib.authenticator.generateSecret();

    const generalSettings = await this.settingsRepository.findValueByKey('general');
    const issuer = String(generalSettings?.store_name || '').trim() || 'ECOMAX';
    const accountName = user?.phone || user?.name || 'admin';
    const otpauthUrl = otplib.authenticator.keyuri(accountName, issuer, secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    await this.userRepository.setTwoFactorSecret(userId, secret);

    return { secret, qrCodeUrl };
  }
}

module.exports = {
  SetupTwoFactorUseCase,
};

