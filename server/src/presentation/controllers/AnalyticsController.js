async function getAnalytics(req, res, next) {
  try {
    const getAnalyticsUseCase = req.app.locals.container?.resolve('getAnalyticsUseCase');
    const analytics = await getAnalyticsUseCase.execute();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnalytics,
};
