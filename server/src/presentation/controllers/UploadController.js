function uploadController(req, res, next) {
  try {
    const useCase = req.app.locals.container?.resolve('handleFileUploadUseCase');
    if (!useCase) {
      throw new Error('HandleFileUploadUseCase is not available');
    }

    const result = useCase.execute({ file: req.file });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadController,
};
