const { IBlacklistRepository } = require('../../domain/repositories/IBlacklistRepository');

class PgBlacklistRepository extends IBlacklistRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findMatches(filters = []) {
    if (!Array.isArray(filters) || filters.length === 0) {
      return [];
    }

    const conditions = [];
    const values = [];

    filters.forEach((filter, index) => {
      const offset = index * 2;
      conditions.push(`(type = $${offset + 1} AND value = $${offset + 2})`);
      values.push(filter.type, filter.value);
    });

    const result = await this.pool.query(
      `SELECT type, value, reason FROM blacklist WHERE ${conditions.join(' OR ')}`,
      values
    );

    return result.rows;
  }

  async findAll() {
    const result = await this.pool.query('SELECT * FROM blacklist ORDER BY created_at DESC');
    return result.rows;
  }

  async upsert({ type, value, reason }) {
    const result = await this.pool.query(
      `
        INSERT INTO blacklist (type, value, reason)
        VALUES ($1, $2, $3)
        ON CONFLICT (type, value) DO UPDATE
        SET reason = EXCLUDED.reason
        RETURNING *
      `,
      [type, value, reason]
    );

    return result.rows[0];
  }

  async deleteById(id) {
    const result = await this.pool.query('DELETE FROM blacklist WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = {
  PgBlacklistRepository,
};
