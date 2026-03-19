class UpdateGreenApiCredentialsUseCase {
  constructor({ settingsRepository }) {
    this.settingsRepository = settingsRepository;
  }

  async execute({ instanceId, apiToken }) {
    if (!instanceId || !apiToken) {
      const error = new Error('instance_id and api_token are required');
      error.status = 400;
      throw error;
    }

    const response = await fetch(`https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`);
    const state = await response.json();

    if (!response.ok || state.stateInstance === undefined) {
      const error = new Error('بيانات Green API غير صالحة');
      error.status = 400;
      error.details = state;
      throw error;
    }

    const current = await this.settingsRepository.findValueByKey('whatsapp_notifications') || {};
    await this.settingsRepository.saveValue('whatsapp_notifications', {
      ...current,
      api_configured: true,
      instance_id: instanceId,
      api_token: apiToken,
    });

    return {
      success: true,
      state: state.stateInstance,
      message: 'تم التحقق من بيانات Green API بنجاح',
    };
  }
}

module.exports = {
  UpdateGreenApiCredentialsUseCase,
};
