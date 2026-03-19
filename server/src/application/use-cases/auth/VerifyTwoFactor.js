const otplib = require('otplib');

class VerifyTwoFactorUseCase {
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
    if (!secret) {
      const error = new Error('المصادقة الثنائية غير مفعلة على هذا الحساب.');
      error.status = 400;
      throw error;
    }

    const isValid = otplib.authenticator.check(code, secret);
    if (!isValid) {
      const error = new Error('كود التحقق غير صحيح.');
      error.status = 400;
      throw error;
    }

    await this.userRepository.enableTwoFactor(userId);
    return { message: 'تم تفعيل المصادقة الثنائية بنجاح.' };
  }
}

module.exports = {
  VerifyTwoFactorUseCase,
};

