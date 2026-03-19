class LogoutUseCase {
  constructor({ authSessionService }) {
    this.authSessionService = authSessionService;
  }

  async execute({ sessionId }) {
    if (!sessionId) {
      return;
    }

    await this.authSessionService.revoke(sessionId, 'logout');
  }
}

module.exports = {
  LogoutUseCase,
};

