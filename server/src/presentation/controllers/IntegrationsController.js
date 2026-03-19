async function facebookCapi(req, res, next) {
  try {
    const useCase = req.app.locals.container.resolve('sendFacebookCapiEventUseCase');
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
    const result = await useCase.execute({ body: req.body, clientIp });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function whatsappNotify(req, res, next) {
  try {
    const useCase = req.app.locals.container.resolve('sendWhatsAppNotificationUseCase');
    const result = await useCase.execute({
      template: req.body.template,
      phone: req.body.phone,
      data: req.body.data,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function updateGreenApi(req, res, next) {
  try {
    const useCase = req.app.locals.container.resolve('updateGreenApiCredentialsUseCase');
    const result = await useCase.execute({
      instanceId: req.body.instance_id,
      apiToken: req.body.api_token,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function testOrderWebhook(req, res, next) {
  try {
    const useCase = req.app.locals.container.resolve('testOrderWebhookUseCase');
    const result = await useCase.execute();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  facebookCapi,
  whatsappNotify,
  updateGreenApi,
  testOrderWebhook,
};
