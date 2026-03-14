const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');

const UPLOADS_PREFIX = '/uploads/';
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

function isLocalUploadUrl(value) {
  return typeof value === 'string' && value.startsWith(UPLOADS_PREFIX);
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

async function isUploadStillReferenced(url) {
  if (!isLocalUploadUrl(url)) return false;

  const checks = await Promise.all([
    pool.query('SELECT 1 FROM products WHERE image_url = $1 LIMIT 1', [url]),
    pool.query('SELECT 1 FROM product_images WHERE image_url = $1 LIMIT 1', [url]),
    pool.query('SELECT 1 FROM categories WHERE image_url = $1 LIMIT 1', [url]),
    pool.query(
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

async function deleteLocalUploadIfUnused(url) {
  const normalizedUrl = normalizeUploadUrl(url);
  if (!normalizedUrl) return false;

  const stillReferenced = await isUploadStillReferenced(normalizedUrl);
  if (stillReferenced) return false;

  const relativeName = normalizedUrl.slice(UPLOADS_PREFIX.length);
  if (!relativeName || relativeName.includes('..') || relativeName.includes('/')) {
    return false;
  }

  const filePath = path.join(UPLOADS_DIR, relativeName);

  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

async function cleanupRemovedUploadUrls(previousUrls, nextUrls = []) {
  const nextSet = new Set((nextUrls || []).map(normalizeUploadUrl).filter(Boolean));
  const candidates = Array.from(new Set((previousUrls || []).map(normalizeUploadUrl).filter(Boolean)));

  for (const url of candidates) {
    if (nextSet.has(url)) continue;
    await deleteLocalUploadIfUnused(url);
  }
}

module.exports = {
  isLocalUploadUrl,
  collectAppearanceUploadUrls,
  deleteLocalUploadIfUnused,
  cleanupRemovedUploadUrls,
};
