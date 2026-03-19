const jwt = require('jsonwebtoken');

const ACCESS_TTL_SECONDS = parseInt(process.env.AUTH_ACCESS_TTL_SECONDS || '900', 10);
const REFRESH_TTL_SECONDS = parseInt(process.env.AUTH_REFRESH_TTL_SECONDS || `${60 * 60 * 24 * 30}`, 10);

class AuthTokenService {
  getTtl() {
    return {
      accessSeconds: ACCESS_TTL_SECONDS,
      refreshSeconds: REFRESH_TTL_SECONDS,
      accessMs: ACCESS_TTL_SECONDS * 1000,
      refreshMs: REFRESH_TTL_SECONDS * 1000,
    };
  }

  signToken(user, type, expiresIn, sessionId) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, type, sessionId },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  issue(user, sessionId) {
    return {
      accessToken: this.signToken(user, 'access', `${ACCESS_TTL_SECONDS}s`, sessionId),
      refreshToken: this.signToken(user, 'refresh', `${REFRESH_TTL_SECONDS}s`, sessionId),
      ttl: this.getTtl(),
    };
  }

  verify(token, expectedType) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== expectedType) {
      const err = new Error(`Invalid token type. Expected ${expectedType}.`);
      err.status = 401;
      throw err;
    }
    return decoded;
  }
}

module.exports = {
  AuthTokenService,
};
