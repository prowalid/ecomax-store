class AuthSessionService {
  constructor({ authSessionRepository }) {
    this.authSessionRepository = authSessionRepository;
  }

  create(payload) {
    return this.authSessionRepository.create(payload);
  }

  revoke(sessionId, reason) {
    return this.authSessionRepository.revoke(sessionId, reason);
  }

  rotate(payload) {
    return this.authSessionRepository.rotate(payload);
  }

  validate(payload) {
    return this.authSessionRepository.validateRefreshSession(payload);
  }
}

module.exports = {
  AuthSessionService,
};
