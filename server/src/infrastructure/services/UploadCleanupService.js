const fs = require('fs/promises');
const { LocalFileStorage } = require('../storage/LocalFileStorage');

function isLocalUploadUrl(value) {
  return typeof value === 'string' && value.startsWith('/uploads/');
}

function normalizeUploadUrl(value) {
  return isLocalUploadUrl(value) ? value.trim() : null;
}

function collectAppearanceUploadUrls(appearance) {
  if (!appearance || typeof appearance !== 'object' || Array.isArray(appearance)) {
    return [];
  }

  const urls = [
    appearance.logo_url,
    appearance.footer_logo_url,
    appearance.favicon_url,
  ];

  if (Array.isArray(appearance.slides)) {
    for (const slide of appearance.slides) {
      if (slide && typeof slide === 'object') {
        urls.push(slide.image_url);
      }
    }
  }

  return Array.from(new Set(urls.map(normalizeUploadUrl).filter(Boolean)));
}

class UploadCleanupService {
  constructor({ pool, fsModule = fs, fileStorage = new LocalFileStorage({}) }) {
    this.pool = pool;
    this.fs = fsModule;
    this.fileStorage = fileStorage;
  }

  isLocalUploadUrl(value) {
    return this.fileStorage.isManagedUrl(value);
  }

  collectAppearanceUploadUrls(appearance) {
    return Array.from(
      new Set(
        collectAppearanceUploadUrls(appearance)
          .map((url) => this.fileStorage.normalizeManagedUrl(url))
          .filter(Boolean)
      )
    );
  }

  async isUploadStillReferenced(url) {
    if (!this.fileStorage.isManagedUrl(url)) return false;

    const checks = await Promise.all([
      this.pool.query('SELECT 1 FROM products WHERE image_url = $1 LIMIT 1', [url]),
      this.pool.query('SELECT 1 FROM product_images WHERE image_url = $1 LIMIT 1', [url]),
      this.pool.query('SELECT 1 FROM categories WHERE image_url = $1 LIMIT 1', [url]),
      this.pool.query(
        `SELECT 1
         FROM store_settings
         WHERE key = 'appearance'
           AND (
             value->>'logo_url' = $1
             OR value->>'footer_logo_url' = $1
             OR value->>'favicon_url' = $1
             OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements(COALESCE(value->'slides', '[]'::jsonb)) AS slide
               WHERE slide->>'image_url' = $1
             )
           )
         LIMIT 1`,
        [url]
      ),
    ]);

    return checks.some((result) => result.rows.length > 0);
  }

  async deleteLocalUploadIfUnused(url) {
    const normalizedUrl = this.fileStorage.normalizeManagedUrl(url);
    if (!normalizedUrl) return false;

    const stillReferenced = await this.isUploadStillReferenced(normalizedUrl);
    if (stillReferenced) return false;

    const filePath = this.fileStorage.resolvePathFromUrl(normalizedUrl);
    if (!filePath) {
      return false;
    }

    try {
      await this.fs.unlink(filePath);
      return true;
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
  }

  async cleanupRemovedUploadUrls(previousUrls, nextUrls = []) {
    const nextSet = new Set((nextUrls || []).map((url) => this.fileStorage.normalizeManagedUrl(url)).filter(Boolean));
    const candidates = Array.from(
      new Set((previousUrls || []).map((url) => this.fileStorage.normalizeManagedUrl(url)).filter(Boolean))
    );

    for (const url of candidates) {
      if (nextSet.has(url)) continue;
      await this.deleteLocalUploadIfUnused(url);
    }
  }
}

module.exports = {
  UploadCleanupService,
  isLocalUploadUrl,
  collectAppearanceUploadUrls,
};
