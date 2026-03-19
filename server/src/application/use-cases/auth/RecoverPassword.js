class RecoverPasswordUseCase {
  constructor({ userRepository, whatsAppRecoveryService }) {
    this.userRepository = userRepository;
    this.whatsAppRecoveryService = whatsAppRecoveryService;
  }

  async execute({ phone }) {
    const user = await this.userRepository.findRecoveryTargetByPhone(phone);
    if (!user) {
      const error = new Error('لا يوجد حساب مرتبط بهذا الرقم.');
      error.status = 404;
      throw error;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60000);

    await this.userRepository.setRecoveryCode(user.id, code, expiresAt.toISOString());

    const result = await this.whatsAppRecoveryService.sendRecoveryCode({
      phone,
      name: user.name,
      code,
    });

    if (!result.success) {
      const error = new Error(result.error || 'فشل إرسال كود الاسترداد عبر واتساب.');
      error.status = 400;
      throw error;
    }

    return { message: 'تم إرسال كود الاسترداد إلى رقمك في واتساب.' };
  }
}

module.exports = {
  RecoverPasswordUseCase,
};

