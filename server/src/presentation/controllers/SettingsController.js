const { collectAppearanceUploadUrls } = require('../../utils/uploadCleanup');
const { recordAdminAudit } = require('./audit');

const PUBLIC_SETTINGS_KEYS = new Set(['appearance', 'general', 'shipping', 'marketing', 'security']);

async function getSettings(req, res, next) {
  const { key } = req.params;

  if (!PUBLIC_SETTINGS_KEYS.has(key) && !req.user) {
    return res.status(403).json({ error: 'Access forbidden: sensitive configuration' });
  }

  if (!/^[a-z0-9_]+$/i.test(key)) {
    return res.status(400).json({ error: 'Invalid settings key' });
  }

  try {
    const getSettingsUseCase = req.app.locals.container?.resolve('getSettingsUseCase');
    const result = await getSettingsUseCase.execute({
      key,
      isAdmin: Boolean(req.user),
    });

    res.set('Cache-Control', 'no-store, must-revalidate');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function saveSettings(req, res, next) {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const saveSettingsUseCase = req.app.locals.container?.resolve('saveSettingsUseCase');
    const uploadCleanupService = req.app.locals.container?.resolve('uploadCleanupService');
    const result = await saveSettingsUseCase.execute({ key, value });

    if (key === 'appearance') {
      const previousAppearanceUrls = collectAppearanceUploadUrls(result.previousValue);
      const nextAppearanceUrls = collectAppearanceUploadUrls(result.value);
      await uploadCleanupService.cleanupRemovedUploadUrls(previousAppearanceUrls, nextAppearanceUrls);
    }

    await recordAdminAudit(req, {
      action: 'settings.save',
      entityType: 'settings',
      entityId: key,
      meta: { key },
    });
    res.json({ value: result.value });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  saveSettings,
};
