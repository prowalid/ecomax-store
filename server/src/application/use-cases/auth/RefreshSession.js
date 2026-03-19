class RefreshSessionUseCase {
  constructor({ userRepository, authTokenService, authSessionService }) {
    this.userRepository = userRepository;
    this.authTokenService = authTokenService;
    this.authSessionService = authSessionService;
  }

  async execute({ refreshToken, requestMeta }) {
    if (!refreshToken) {
      const error = new Error('Refresh token is missing.');
      error.status = 401;
      throw error;
    }

    const decoded = this.authTokenService.verify(refreshToken, 'refresh');
    const session = await this.authSessionService.validate({
      sessionId: decoded.sessionId,
      userId: decoded.id,
      refreshToken,
    });

    if (!session) {
      const error = new Error('Refresh session is invalid or revoked.');
      error.status = 401;
      throw error;
    }

    const user = await this.userRepository.findPublicById(decoded.id);
    if (!user) {
      const error = new Error('User not found for refresh token.');
      error.status = 401;
      throw error;
    }

    const { accessToken, refreshToken: nextRefreshToken, ttl } = this.authTokenService.issue(user, decoded.sessionId);
    const rotatedSession = await this.authSessionService.rotate({
      sessionId: decoded.sessionId,
      refreshToken: nextRefreshToken,
      refreshTtlSeconds: ttl.refreshSeconds,
      ...requestMeta,
    });

    if (!rotatedSession) {
      const error = new Error('Refresh session could not be rotated.');
      error.status = 401;
      throw error;
    }

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      ttl,
      user,
    };
  }
}

module.exports = {
  RefreshSessionUseCase,
};

