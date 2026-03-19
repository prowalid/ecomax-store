const bcrypt = require('bcryptjs');

class ChangePasswordUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId, currentPassword, newPassword }) {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      const error = new Error('بيانات كلمة المرور غير صالحة.');
      error.status = 400;
      throw error;
    }

    const user = await this.userRepository.findPasswordHashById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      const error = new Error('كلمة المرور الحالية غير صحيحة.');
      error.status = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.updatePassword(userId, newHash);

    return { message: 'تم تغيير كلمة المرور بنجاح.' };
  }
}

module.exports = {
  ChangePasswordUseCase,
};

