async function getBlacklist(req, res, next) {
  try {
    const getBlacklistUseCase = req.app.locals.container?.resolve('getBlacklistUseCase');
    const entries = await getBlacklistUseCase.execute();
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

async function addToBlacklist(req, res, next) {
  try {
    const addToBlacklistUseCase = req.app.locals.container?.resolve('addToBlacklistUseCase');
    const entry = await addToBlacklistUseCase.execute(req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

async function removeFromBlacklist(req, res, next) {
  try {
    const removeFromBlacklistUseCase = req.app.locals.container?.resolve('removeFromBlacklistUseCase');
    await removeFromBlacklistUseCase.execute({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
};
