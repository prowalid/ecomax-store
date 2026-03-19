async function validateBotProtection(req, res, next) {
  try {
    const container = req.app?.locals?.container;
    const useCase = container?.resolve('validateOrderSecurityUseCase');
    if (!useCase) {
      return next();
    }

    const customerPhone = req.body.customer_phone;
    const clientIp = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) || req.ip;
    await useCase.execute({
      customerPhone,
      websiteUrl: req.body.website_url,
      turnstileToken: req.body['cf-turnstile-response'],
      clientIp,
    });
    return next();
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        error: err.message,
        code: err.code || 'SECURITY_CHECK_FAILED',
        ...(err.details ? { details: err.details } : {}),
      });
    }

    console.error('[Security Error]', err);
    return res.status(503).json({
      error: 'تعذر التحقق من الحماية حاليًا. يرجى المحاولة بعد قليل.',
      code: 'SECURITY_CHECK_UNAVAILABLE',
    });
  }
}

module.exports = { validateBotProtection };
