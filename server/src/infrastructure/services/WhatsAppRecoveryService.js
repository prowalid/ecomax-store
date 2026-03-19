class WhatsAppRecoveryService {
  constructor({ whatsAppMessagingService }) {
    this.whatsAppMessagingService = whatsAppMessagingService;
  }

  async sendRecoveryCode({ phone, name, code }) {
    return this.whatsAppMessagingService.send({
      template: 'custom',
      phone,
      data: {
        message: `🔐 *استعادة كلمة المرور*\n\nمرحباً ${name || 'مدير المتجر'}\nكود الاسترداد الخاص بك هو:\n\n*${code}*\n\nصلاحية الكود: 15 دقيقة.\nإذا لم تطلب هذا الإجراء فتجاهل الرسالة.`,
      },
    });
  }
}

module.exports = {
  WhatsAppRecoveryService,
};
