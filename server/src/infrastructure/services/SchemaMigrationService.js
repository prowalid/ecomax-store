const fs = require('fs/promises');
const path = require('path');

const DEFAULT_APPEARANCE_SETTINGS = {
  logo_url: '',
  footer_logo_url: '',
  favicon_url: '',
  store_name: 'ECOMAX',
  accent_color: '#dc3545',
  top_bar_bg: '#dc3545',
  top_bar_text: '#ffffff',
  header_bg: '#ffffff',
  header_text: '#1f2937',
  button_color: '#dc3545',
  button_text: '#ffffff',
  footer_bg: '#111827',
  footer_text: '#ffffff',
  footer_accent: '#dc3545',
  badge_bg: '#f4f6f8',
  badge_text: '#1f2937',
  body_bg: '#f8f9fa',
  heading_font: 'Cairo',
  body_font: 'Cairo',
  slides: [
    { image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600' },
    { image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600' },
    { image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600' },
  ],
  offers_banner_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=1400',
};

function normalizeSlides(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const slides = value
    .map((entry) => {
      if (typeof entry === 'string' && entry.trim()) {
        return { image_url: entry.trim(), href: '' };
      }

      if (entry && typeof entry === 'object' && typeof entry.image_url === 'string' && entry.image_url.trim()) {
        return {
          image_url: entry.image_url.trim(),
          href: typeof entry.href === 'string' ? entry.href.trim() : '',
        };
      }

      return null;
    })
    .filter(Boolean);

  return slides;
}

function isLegacyDefaultAppearance(value) {
  return value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !('accent_color' in value)
    && value.primary_color === '#0d6847'
    && value.button_color === '#0d6847'
    && value.bg_color === '#f4f5f7';
}

function normalizeAppearanceSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return DEFAULT_APPEARANCE_SETTINGS;
  }

  if ('accent_color' in value) {
    return {
      ...DEFAULT_APPEARANCE_SETTINGS,
      ...value,
      slides: normalizeSlides(value.slides),
      offers_banner_url: typeof value.offers_banner_url === 'string'
        ? value.offers_banner_url.trim()
        : '',
    };
  }

  if (isLegacyDefaultAppearance(value)) {
    return DEFAULT_APPEARANCE_SETTINGS;
  }

  const accent = typeof value.primary_color === 'string' && value.primary_color.trim()
    ? value.primary_color.trim()
    : DEFAULT_APPEARANCE_SETTINGS.accent_color;
  const button = typeof value.button_color === 'string' && value.button_color.trim()
    ? value.button_color.trim()
    : accent;
  const bodyBg = typeof value.bg_color === 'string' && value.bg_color.trim()
    ? value.bg_color.trim()
    : DEFAULT_APPEARANCE_SETTINGS.body_bg;

  return {
    ...DEFAULT_APPEARANCE_SETTINGS,
    logo_url: typeof value.logo_url === 'string' ? value.logo_url : DEFAULT_APPEARANCE_SETTINGS.logo_url,
    footer_logo_url: typeof value.footer_logo_url === 'string' ? value.footer_logo_url : DEFAULT_APPEARANCE_SETTINGS.footer_logo_url,
    favicon_url: typeof value.favicon_url === 'string' ? value.favicon_url : DEFAULT_APPEARANCE_SETTINGS.favicon_url,
    store_name: typeof value.store_name === 'string' && value.store_name.trim() ? value.store_name.trim() : DEFAULT_APPEARANCE_SETTINGS.store_name,
    accent_color: accent,
    top_bar_bg: accent,
    top_bar_text: DEFAULT_APPEARANCE_SETTINGS.top_bar_text,
    header_bg: DEFAULT_APPEARANCE_SETTINGS.header_bg,
    header_text: DEFAULT_APPEARANCE_SETTINGS.header_text,
    button_color: button,
    button_text: DEFAULT_APPEARANCE_SETTINGS.button_text,
    footer_bg: DEFAULT_APPEARANCE_SETTINGS.footer_bg,
    footer_text: DEFAULT_APPEARANCE_SETTINGS.footer_text,
    footer_accent: accent,
    badge_bg: DEFAULT_APPEARANCE_SETTINGS.badge_bg,
    badge_text: DEFAULT_APPEARANCE_SETTINGS.badge_text,
    body_bg: bodyBg,
    heading_font: typeof value.heading_font === 'string' && value.heading_font.trim() ? value.heading_font.trim() : DEFAULT_APPEARANCE_SETTINGS.heading_font,
    body_font: typeof value.body_font === 'string' && value.body_font.trim() ? value.body_font.trim() : DEFAULT_APPEARANCE_SETTINGS.body_font,
    slides: normalizeSlides(value.slides),
    offers_banner_url: typeof value.offers_banner_url === 'string'
      ? value.offers_banner_url.trim()
      : '',
  };
}

class SchemaMigrationService {
  constructor({ pool, migrationsDir = path.join(__dirname, '../../db/migrations') }) {
    this.pool = pool;
    this.migrationsDir = migrationsDir;
  }

  async ensureMigrationTable() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  async getAppliedMigrationNames() {
    await this.ensureMigrationTable();
    const { rows } = await this.pool.query('SELECT name FROM schema_migrations ORDER BY name ASC');
    return new Set(rows.map((row) => row.name));
  }

  async listMigrationPairs() {
    const entries = await fs.readdir(this.migrationsDir);
    const upFiles = entries
      .filter((entry) => entry.endsWith('.up.sql'))
      .sort();

    return upFiles.map((upFile) => {
      const name = upFile.replace(/\.up\.sql$/, '');
      return {
        name,
        upFile,
        downFile: `${name}.down.sql`,
      };
    });
  }

  async readMigrationSql(filename) {
    return fs.readFile(path.join(this.migrationsDir, filename), 'utf8');
  }

  async applyMigration(migration) {
    const sql = await this.readMigrationSql(migration.upFile);
    await this.pool.query('BEGIN');
    try {
      await this.pool.query(sql);
      await this.pool.query('INSERT INTO schema_migrations(name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [migration.name]);
      await this.pool.query('COMMIT');
    } catch (error) {
      await this.pool.query('ROLLBACK');
      throw error;
    }
  }

  async runPendingMigrations() {
    const migrations = await this.listMigrationPairs();
    const applied = await this.getAppliedMigrationNames();

    for (const migration of migrations) {
      if (!applied.has(migration.name)) {
        await this.applyMigration(migration);
      }
    }
  }

  async rollbackLastMigration() {
    await this.ensureMigrationTable();
    const { rows } = await this.pool.query('SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1');
    if (rows.length === 0) {
      return null;
    }

    const migrationName = rows[0].name;
    const downFile = `${migrationName}.down.sql`;
    const sql = await this.readMigrationSql(downFile);

    await this.pool.query('BEGIN');
    try {
      await this.pool.query(sql);
      await this.pool.query('DELETE FROM schema_migrations WHERE name = $1', [migrationName]);
      await this.pool.query('COMMIT');
      return migrationName;
    } catch (error) {
      await this.pool.query('ROLLBACK');
      throw error;
    }
  }

  async ensureAppearanceSettingsShape() {
    const { rows } = await this.pool.query("SELECT value FROM store_settings WHERE key = 'appearance' LIMIT 1");

    if (rows.length === 0) {
      return;
    }

    const normalized = normalizeAppearanceSettings(rows[0].value);

    await this.pool.query(
      "UPDATE store_settings SET value = $1, updated_at = now() WHERE key = 'appearance'",
      [normalized]
    );
  }
}

module.exports = {
  DEFAULT_APPEARANCE_SETTINGS,
  normalizeAppearanceSettings,
  SchemaMigrationService,
};
