function isValidSessionId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{16,128}$/.test(value);
}

module.exports = {
  isValidSessionId,
};

