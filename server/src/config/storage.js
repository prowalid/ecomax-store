const path = require('path');

function normalizePublicPrefix(value) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : '/uploads';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/uploads';
}

function getStorageConfig() {
  const uploadsDir = process.env.STORAGE_UPLOADS_DIR
    ? path.resolve(process.env.STORAGE_UPLOADS_DIR)
    : path.join(__dirname, '../../public/uploads');

  return {
    driver: process.env.STORAGE_DRIVER || 'local',
    uploadsDir,
    publicPrefix: normalizePublicPrefix(process.env.STORAGE_PUBLIC_PREFIX),
  };
}

module.exports = {
  getStorageConfig,
};
