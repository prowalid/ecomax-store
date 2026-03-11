const ACCESS_COOKIE_NAME = 'etk_access_token';
const REFRESH_COOKIE_NAME = 'etk_refresh_token';

const ACCESS_COOKIE_PATH = '/';
const REFRESH_COOKIE_PATH = '/api/auth';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getCookieBaseOptions({ maxAge, path, httpOnly = true }) {
  return {
    httpOnly,
    secure: isProduction(),
    sameSite: 'lax',
    path,
    maxAge,
  };
}

function setAuthCookies(res, accessToken, refreshToken, ttl) {
  res.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    getCookieBaseOptions({
      maxAge: ttl.accessMs,
      path: ACCESS_COOKIE_PATH,
    })
  );

  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getCookieBaseOptions({
      maxAge: ttl.refreshMs,
      path: REFRESH_COOKIE_PATH,
    })
  );
}

function clearAuthCookies(res) {
  res.clearCookie(
    ACCESS_COOKIE_NAME,
    getCookieBaseOptions({
      path: ACCESS_COOKIE_PATH,
    })
  );

  res.clearCookie(
    REFRESH_COOKIE_NAME,
    getCookieBaseOptions({
      path: REFRESH_COOKIE_PATH,
    })
  );
}

function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

function getCookieValue(req, name) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[name] || null;
}

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
  getCookieValue,
};
