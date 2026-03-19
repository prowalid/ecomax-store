const { ISettingsRepository } = require('../../domain/repositories/ISettingsRepository');

class PgSettingsRepository extends ISettingsRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findValuesByKeys(keys) {
    if (!Array.isArray(keys) || keys.length === 0) {
      return [];
    }

    const result = await this.pool.query(
      'SELECT key, value FROM store_settings WHERE key = ANY($1)',
      [keys]
    );

    return result.rows;
  }

  async findValueByKey(key) {
    const result = await this.pool.query(
      'SELECT value FROM store_settings WHERE key = $1 LIMIT 1',
      [key]
    );

    return result.rows[0]?.value ?? null;
  }

  async saveMerged(key, value, updatedAt = new Date().toISOString()) {
    const result = await this.pool.query(
      `
        INSERT INTO store_settings (key, value, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE
        SET value = store_settings.value || EXCLUDED.value, updated_at = EXCLUDED.updated_at
        RETURNING value
      `,
      [key, value, updatedAt]
    );

    return result.rows[0]?.value ?? {};
  }

  async saveValue(key, value, updatedAt = new Date().toISOString()) {
    const result = await this.pool.query(
      `
        INSERT INTO store_settings (key, value, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
        RETURNING value
      `,
      [key, value, updatedAt]
    );

    return result.rows[0]?.value ?? {};
  }
}

module.exports = {
  PgSettingsRepository,
};
