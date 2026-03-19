const { IUserRepository } = require('../../domain/repositories/IUserRepository');

class PgUserRepository extends IUserRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async countAll() {
    const result = await this.pool.query('SELECT COUNT(*) FROM users');
    return Number.parseInt(result.rows[0]?.count || '0', 10);
  }

  async findPublicById(id) {
    const result = await this.pool.query(
      'SELECT id, name, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  async findProfileById(id) {
    const result = await this.pool.query(
      'SELECT id, name, phone, role, two_factor_enabled FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  async findAuthByPhone(phone) {
    const result = await this.pool.query(
      `
        SELECT id, name, phone, email, password_hash, role, two_factor_enabled, two_factor_secret
        FROM users
        WHERE phone = $1
      `,
      [phone]
    );

    return result.rows[0] || null;
  }

  async createAdmin({ name, phone, email, passwordHash }) {
    const payload = typeof name === 'object' && name !== null
      ? { ...name.toPersistence(), passwordHash: phone }
      : { name, phone, email, passwordHash };

    const result = await this.pool.query(
      `
        INSERT INTO users (name, phone, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, phone, role, created_at
      `,
      [payload.name, payload.phone, payload.email, payload.passwordHash, payload.role || 'admin']
    );

    return result.rows[0] || null;
  }

  async findPasswordHashById(id) {
    const result = await this.pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  async updatePassword(id, passwordHash) {
    await this.pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, id]
    );
  }

  async findNameAndPhoneById(id) {
    const result = await this.pool.query(
      'SELECT name, phone FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  async setTwoFactorSecret(id, secret) {
    await this.pool.query(
      'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
      [secret, id]
    );
  }

  async findTwoFactorSecretById(id) {
    const result = await this.pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0]?.two_factor_secret || null;
  }

  async enableTwoFactor(id) {
    await this.pool.query(
      'UPDATE users SET two_factor_enabled = true WHERE id = $1',
      [id]
    );
  }

  async disableTwoFactor(id) {
    await this.pool.query(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = null WHERE id = $1',
      [id]
    );
  }

  async findRecoveryTargetByPhone(phone) {
    const result = await this.pool.query(
      'SELECT id, name FROM users WHERE phone = $1',
      [phone]
    );

    return result.rows[0] || null;
  }

  async setRecoveryCode(id, code, expiresAtIso) {
    await this.pool.query(
      'UPDATE users SET recovery_code = $1, recovery_code_expires_at = $2 WHERE id = $3',
      [code, expiresAtIso, id]
    );
  }

  async findRecoveryByPhone(phone) {
    const result = await this.pool.query(
      'SELECT id, recovery_code, recovery_code_expires_at FROM users WHERE phone = $1',
      [phone]
    );

    return result.rows[0] || null;
  }

  async resetPasswordWithRecovery(id, passwordHash) {
    await this.pool.query(
      `
        UPDATE users
        SET password_hash = $1,
            recovery_code = null,
            recovery_code_expires_at = null
        WHERE id = $2
      `,
      [passwordHash, id]
    );
  }

  async updateProfile(id, { name, phone, email }) {
    const payload = typeof name === 'object' && name !== null
      ? name.toPersistence()
      : { name, phone, email };

    const result = await this.pool.query(
      `
        UPDATE users
        SET name = $1, phone = $2, email = $3
        WHERE id = $4
        RETURNING id, name, phone, role, two_factor_enabled
      `,
      [payload.name, payload.phone, payload.email, id]
    );

    return result.rows[0] || null;
  }
}

module.exports = {
  PgUserRepository,
};
