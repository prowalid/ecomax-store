const bcrypt = require('bcryptjs');

class ResetPasswordUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ phone, code, newPassword }) {
    if (!newPassword || newPassword.length < 6) {
      const error = new Error('كلمة المرور الجديدة غير صالحة.');
      error.status = 400;
      throw error;
    }

    const user = await this.userRepository.findRecoveryByPhone(phone);
    if (!user) {
      const error = new Error('Invalid request.');
      error.status = 400;
      throw error;
    }

    if (!user.recovery_code || user.recovery_code !== code || new Date() > new Date(user.recovery_code_expires_at)) {
      const error = new Error('الكود خاطئ أو منتهي الصلاحية.');
      error.status = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.resetPasswordWithRecovery(user.id, newHash);

    return { message: 'تم إعادة تعيين كلمة المرور بنجاح.' };
  }
}

module.exports = {
  ResetPasswordUseCase,
};

