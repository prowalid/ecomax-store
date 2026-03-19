class SendWhatsAppNotificationUseCase {
  constructor({ whatsAppMessagingService }) {
    this.whatsAppMessagingService = whatsAppMessagingService;
  }

  async execute({ template, phone, data }) {
    const result = await this.whatsAppMessagingService.send({ template, phone, data });
    if (!result.success) {
      const error = new Error(result.error || 'WhatsApp request failed');
      error.status = 400;
      throw error;
    }

    return result;
  }
}

module.exports = {
  SendWhatsAppNotificationUseCase,
};
