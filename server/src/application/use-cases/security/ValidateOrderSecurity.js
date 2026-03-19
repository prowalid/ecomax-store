class ValidateOrderSecurityUseCase {
  constructor({
    settingsRepository,
    blacklistRepository,
    orderRepository,
    turnstileVerifier,
  }) {
    this.settingsRepository = settingsRepository;
    this.blacklistRepository = blacklistRepository;
    this.orderRepository = orderRepository;
    this.turnstileVerifier = turnstileVerifier;
  }

  async execute({
    customerPhone,
    websiteUrl,
    turnstileToken,
    clientIp,
  }) {
    const security = await this.settingsRepository.findValueByKey('security')
      || { turnstile_enabled: false, honeypot_enabled: true };

    const filters = [
      clientIp ? { type: 'ip', value: clientIp } : null,
      customerPhone ? { type: 'phone', value: customerPhone } : null,
    ].filter(Boolean);

    if (filters.length > 0) {
      const matches = await this.blacklistRepository.findMatches(filters);

      if (matches.length > 0) {
        const blocked = matches[0];
        const error = new Error('Access denied. Your information is blacklisted.');
        error.status = 403;
        error.code = 'BLACKLISTED';
        error.details = {
          type: blocked.type,
          value: blocked.value,
        };
        throw error;
      }
    }

    if (customerPhone) {
      const phoneRegex = /^0[5-7][0-9]{8}$/;
      if (!phoneRegex.test(customerPhone)) {
        const error = new Error('رقم الهاتف غير صالح. يجب أن يكون رقم جزائري صحيح (05/06/07).');
        error.status = 400;
        error.code = 'INVALID_PHONE';
        throw error;
      }
    }

    if (websiteUrl && security.honeypot_enabled !== false) {
      const error = new Error('Bot activity detected.');
      error.status = 400;
      error.code = 'BOT_DETECTED_HONEYPOT';
      throw error;
    }

    if (customerPhone || clientIp) {
      const hasRecentOrderAttempt = await this.orderRepository.hasRecentOrderAttempt({
        customerPhone,
        ipAddress: clientIp,
        withinMinutes: 5,
      });

      if (hasRecentOrderAttempt) {
        const error = new Error('لديك طلب قيد المعالجة بالفعل. يرجى الانتظار 5 دقائق قبل إرسال طلب جديد.');
        error.status = 429;
        error.code = 'DUPLICATE_ORDER';
        throw error;
      }
    }

    if (security.turnstile_enabled && security.secret_key) {
      if (!turnstileToken) {
        const error = new Error('Security verification failed. Please refresh and try again.');
        error.status = 400;
        error.code = 'MISSING_TURNSTILE_TOKEN';
        throw error;
      }

      const verification = await this.turnstileVerifier.verify({
        token: turnstileToken,
        secretKey: security.secret_key,
        remoteIp: clientIp,
      });

      if (!verification.success) {
        const error = new Error('Security verification failed. Are you a robot?');
        error.status = 400;
        error.code = 'INVALID_TURNSTILE_TOKEN';
        error.details = verification.errorCodes;
        throw error;
      }
    }

    return {
      allowed: true,
      security,
    };
  }
}

module.exports = {
  ValidateOrderSecurityUseCase,
};
