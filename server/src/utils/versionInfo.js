const fs = require('fs');
const path = require('path');

function inferChannel(version) {
  if (!version) return 'unknown';
  if (version === 'stepdz-test') return 'test';
  if (/^v\d+\.\d+\.\d+$/.test(version)) return 'stable';
  return 'development';
}

function loadReleaseManifest() {
  const candidates = [
    path.resolve(__dirname, '../../../deploy/releases.json'),
    path.resolve(process.cwd(), 'deploy/releases.json'),
    path.resolve(process.cwd(), 'releases.json'),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return {
          manifest: JSON.parse(fs.readFileSync(candidate, 'utf8')),
          source: candidate,
        };
      }
    } catch (error) {
      console.error(`Failed to read release manifest from ${candidate}:`, error);
    }
  }

  return { manifest: null, source: null };
}

function getCurrentVersionInfo() {
  const apiVersion = process.env.ETK_API_VERSION || process.env.APP_VERSION || 'development';
  const webVersion = process.env.ETK_WEB_VERSION || process.env.WEB_VERSION || apiVersion;

  return {
    app: 'express-trade-kit',
    api_version: apiVersion,
    web_version: webVersion,
    git_commit: process.env.ETK_GIT_COMMIT || process.env.GIT_COMMIT || null,
    build_time: process.env.ETK_BUILD_TIME || process.env.BUILD_TIME || null,
    release_channel: process.env.ETK_RELEASE_CHANNEL || inferChannel(apiVersion),
    api_image: process.env.ETK_API_IMAGE_REF || null,
    web_image: process.env.ETK_WEB_IMAGE_REF || null,
  };
}

function getVersionPayload() {
  const current = getCurrentVersionInfo();
  const { manifest, source } = loadReleaseManifest();
  const latestStableVersion = manifest?.latest?.stable || null;
  const latestRelease = manifest?.releases?.find((entry) => entry.version === latestStableVersion) || null;

  return {
    current,
    latest_release: latestRelease,
    manifest_source: source ? path.basename(source) : null,
  };
}

module.exports = {
  getVersionPayload,
};
