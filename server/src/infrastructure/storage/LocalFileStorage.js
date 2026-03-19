const path = require('path');

const DEFAULT_UPLOADS_DIR = path.join(__dirname, '../../../public/uploads');

class LocalFileStorage {
  constructor({ uploadsDir = DEFAULT_UPLOADS_DIR, publicPrefix = '/uploads', pathModule = path, now = () => Date.now(), random = () => Math.random() }) {
    this.path = pathModule;
    this.uploadsDir = uploadsDir;
    this.publicPrefix = this.#normalizePublicPrefix(publicPrefix);
    this.now = now;
    this.random = random;
  }

  getUploadsDir() {
    return this.uploadsDir;
  }

  getPublicPrefix() {
    return this.publicPrefix;
  }

  isManagedUrl(value) {
    return typeof value === 'string' && value.trim().startsWith(`${this.publicPrefix}/`);
  }

  normalizeManagedUrl(value) {
    return this.isManagedUrl(value) ? value.trim() : null;
  }

  generateStoredFilename(originalName = '') {
    const extension = this.path.extname(originalName || '').toLowerCase();
    const uniqueSuffix = `${this.now()}-${Math.round(this.random() * 1e9)}`;
    return `${uniqueSuffix}${extension}`;
  }

  buildPublicUrl(filename) {
    if (!filename || typeof filename !== 'string') {
      return null;
    }

    return `${this.publicPrefix}/${filename}`;
  }

  extractFilename(url) {
    const normalizedUrl = this.normalizeManagedUrl(url);
    if (!normalizedUrl) {
      return null;
    }

    const prefix = `${this.publicPrefix}/`;
    const relativeName = normalizedUrl.slice(prefix.length);
    if (!relativeName || relativeName.includes('..') || relativeName.includes('/')) {
      return null;
    }

    return relativeName;
  }

  resolvePathFromUrl(url) {
    const filename = this.extractFilename(url);
    if (!filename) {
      return null;
    }

    return this.path.join(this.uploadsDir, filename);
  }

  toUploadedFileResponse(file) {
    return {
      url: this.buildPublicUrl(file?.filename),
    };
  }

  #normalizePublicPrefix(value) {
    const raw = typeof value === 'string' && value.trim() ? value.trim() : '/uploads';
    const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
    return withLeadingSlash.replace(/\/+$/, '') || '/uploads';
  }
}

module.exports = {
  LocalFileStorage,
};
