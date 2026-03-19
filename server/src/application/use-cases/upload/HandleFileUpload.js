class HandleFileUploadUseCase {
  constructor({ fileStorage }) {
    this.fileStorage = fileStorage;
  }

  execute({ file }) {
    if (!file) {
      const error = new Error('No file uploaded');
      error.status = 400;
      throw error;
    }

    return this.fileStorage.toUploadedFileResponse(file);
  }
}

module.exports = {
  HandleFileUploadUseCase,
};
