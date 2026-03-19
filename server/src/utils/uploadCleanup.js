const pool = require('../config/db');
const {
  UploadCleanupService,
  isLocalUploadUrl,
  collectAppearanceUploadUrls,
} = require('../infrastructure/services/UploadCleanupService');

const service = new UploadCleanupService({ pool });

async function deleteLocalUploadIfUnused(url) {
  return service.deleteLocalUploadIfUnused(url);
}

async function cleanupRemovedUploadUrls(previousUrls, nextUrls = []) {
  return service.cleanupRemovedUploadUrls(previousUrls, nextUrls);
}

module.exports = {
  isLocalUploadUrl,
  collectAppearanceUploadUrls,
  deleteLocalUploadIfUnused,
  cleanupRemovedUploadUrls,
};
