const {
  clearAuthCookies,
  getCookieValue,
  setAuthCookies,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} = require('../../infrastructure/services/AuthCookieService');
const { AuthTokenService } = require('../../infrastructure/services/AuthTokenService');
const { UserDTO } = require('../../application/dto');
const { recordAdminAudit } = require('./audit');

const authTokenService = new AuthTokenService();

function getRequestMeta(req) {
  return {
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
  };
}

function getSessionIdFromRequest(req) {
  const tokenEntries = [
    { token: getCookieValue(req, REFRESH_COOKIE_NAME), type: 'refresh' },
    { token: getCookieValue(req, ACCESS_COOKIE_NAME), type: 'access' },
  ].filter((entry) => entry.token);

  for (const { token, type } of tokenEntries) {
    try {
      const decoded = authTokenService.verify(token, type);
      if (decoded.sessionId) {
        return decoded.sessionId;
      }
    } catch (_err) {
      // Ignore invalid cookie while attempting best-effort revocation.
    }
  }

  return null;
}

async function register(req, res, next) {
  try {
    const registerUseCase = req.app.locals.container?.resolve('registerUseCase');
    const result = await registerUseCase.execute({
      name: req.body.name,
      phone: req.body.phone,
      password: req.body.password,
      requestMeta: getRequestMeta(req),
    });
    setAuthCookies(res, result.accessToken, result.refreshToken, result.ttl);

    res.status(201).json({
      message: result.message,
      user: UserDTO.from(result.user),
    });
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Phone already exists.' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const loginUseCase = req.app.locals.container?.resolve('loginUseCase');
    const result = await loginUseCase.execute({
      phone: req.body.phone,
      password: req.body.password,
      twoFactorCode: req.body.twoFactorCode,
      requestMeta: getRequestMeta(req),
    });
    setAuthCookies(res, result.accessToken, result.refreshToken, result.ttl);

    res.json({
      user: UserDTO.from(result.user),
    });
  } catch (err) {
    if (err.requires_2fa) {
      return res.status(403).json({ error: err.message, requires_2fa: true });
    }
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const getCurrentUserUseCase = req.app.locals.container?.resolve('getCurrentUserUseCase');
    const result = await getCurrentUserUseCase.execute({ userId: req.user.id });
    res.json(UserDTO.from(result));
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshUseCase = req.app.locals.container?.resolve('refreshSessionUseCase');
    const result = await refreshUseCase.execute({
      refreshToken: getCookieValue(req, REFRESH_COOKIE_NAME),
      requestMeta: getRequestMeta(req),
    });
    setAuthCookies(res, result.accessToken, result.refreshToken, result.ttl);

    res.json({ user: UserDTO.from(result.user) });
  } catch (err) {
    clearAuthCookies(res);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const logoutUseCase = req.app.locals.container?.resolve('logoutUseCase');
    await logoutUseCase.execute({ sessionId: getSessionIdFromRequest(req) });
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function checkSetupStatus(req, res, next) {
  try {
    const getSetupStatusUseCase = req.app.locals.container?.resolve('getSetupStatusUseCase');
    const result = await getSetupStatusUseCase.execute();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const getProfileUseCase = req.app.locals.container?.resolve('getProfileUseCase');
    const profile = await getProfileUseCase.execute({ userId: req.user.id });
    res.json(UserDTO.from(profile));
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updateProfileUseCase = req.app.locals.container?.resolve('updateProfileUseCase');
    const profile = await updateProfileUseCase.execute({
      userId: req.user.id,
      name: req.body.name,
      phone: req.body.phone,
    });
    await recordAdminAudit(req, {
      action: 'profile.update',
      entityType: 'user',
      entityId: req.user.id,
    });
    res.json(UserDTO.from(profile));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Phone already exists.' });
    }
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const changePasswordUseCase = req.app.locals.container?.resolve('changePasswordUseCase');
    const result = await changePasswordUseCase.execute({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
    await recordAdminAudit(req, {
      action: 'password.change',
      entityType: 'user',
      entityId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function setup2FA(req, res, next) {
  try {
    const setupTwoFactorUseCase = req.app.locals.container?.resolve('setupTwoFactorUseCase');
    const result = await setupTwoFactorUseCase.execute({ userId: req.user.id });
    await recordAdminAudit(req, {
      action: '2fa.setup',
      entityType: 'user',
      entityId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function verify2FA(req, res, next) {
  try {
    const verifyTwoFactorUseCase = req.app.locals.container?.resolve('verifyTwoFactorUseCase');
    const result = await verifyTwoFactorUseCase.execute({
      userId: req.user.id,
      code: req.body.code,
    });
    await recordAdminAudit(req, {
      action: '2fa.verify',
      entityType: 'user',
      entityId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function disable2FA(req, res, next) {
  try {
    const disableTwoFactorUseCase = req.app.locals.container?.resolve('disableTwoFactorUseCase');
    const result = await disableTwoFactorUseCase.execute({
      userId: req.user.id,
      code: req.body.code,
    });
    await recordAdminAudit(req, {
      action: '2fa.disable',
      entityType: 'user',
      entityId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function recoverPassword(req, res, next) {
  try {
    const recoverPasswordUseCase = req.app.locals.container?.resolve('recoverPasswordUseCase');
    const result = await recoverPasswordUseCase.execute({ phone: req.body.phone });
    res.json(result);
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const resetPasswordUseCase = req.app.locals.container?.resolve('resetPasswordUseCase');
    const result = await resetPasswordUseCase.execute({
      phone: req.body.phone,
      code: req.body.code,
      newPassword: req.body.newPassword,
    });
    res.json(result);
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  checkSetupStatus,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  recoverPassword,
  resetPassword,
};
