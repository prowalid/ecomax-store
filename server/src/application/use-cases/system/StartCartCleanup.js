class StartCartCleanupUseCase {
  constructor({ cartCleanupService }) {
    this.cartCleanupService = cartCleanupService;
  }

  execute() {
    this.cartCleanupService.startCleanupJob();
  }
}

module.exports = {
  StartCartCleanupUseCase,
};
