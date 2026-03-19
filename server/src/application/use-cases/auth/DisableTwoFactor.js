const otplib = require('otplib');

class DisableTwoFactorUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId, code }) {
    if (!code) {
      const error = new Error('كود التحقق مطلوب.');
      error.status = 400;
      throw error;
    }

    const secret = await this.userRepository.findTwoFactorSecretById(userId);
    const isValid = otplib.authenticator.check(code, secret);
    if (!isValid) {
      const error = new Error('كود التحقق غير صحيح.');
      error.status = 400;
      throw error;
    }

    await this.userRepository.disableTwoFactor(userId);
    return { message: 'تم تعطيل المصادقة الثنائية.' };
  }
}

module.exports = {
  DisableTwoFactorUseCase,
};

