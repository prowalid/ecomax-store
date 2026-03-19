function normalizeString(value) {
  return String(value)
    .normalize('NFKC')
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, '');
}

function sanitizeHtml(value) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|link|meta)[^>]*?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, '');
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeValue(value, options, path = '') {
  if (typeof value === 'string') {
    const normalized = normalizeString(value);

    if (options.allowHtmlPaths.has(path)) {
      return sanitizeHtml(normalized);
    }

    return stripHtml(normalized);
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) => sanitizeValue(entry, options, `${path}[${index}]`));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        const nextPath = path ? `${path}.${key}` : key;
        return [key, sanitizeValue(entry, options, nextPath)];
      })
    );
  }

  return value;
}

function createSanitizeBody({ allowHtmlPaths = [] } = {}) {
  const options = {
    allowHtmlPaths: new Set(allowHtmlPaths),
  };

  return function sanitizeBody(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body, options);
    }

    next();
  };
}

module.exports = {
  createSanitizeBody,
};
