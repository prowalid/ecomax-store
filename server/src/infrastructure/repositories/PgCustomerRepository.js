const { ICustomerRepository } = require('../../domain/repositories/ICustomerRepository');

class PgCustomerRepository extends ICustomerRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findAll() {
    const result = await this.pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    return result.rows;
  }

  async findByPhone(phone) {
    const result = await this.pool.query(
      'SELECT * FROM customers WHERE phone = $1 LIMIT 1',
      [phone]
    );

    return result.rows[0] ?? null;
  }

  async create({ name, phone, wilaya, commune, address, notes }) {
    const payload = typeof name === 'object' && name !== null
      ? name.toPersistence()
      : { name, phone, wilaya, commune, address, notes };

    const result = await this.pool.query(
      `
        INSERT INTO customers (name, phone, wilaya, commune, address, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [payload.name, payload.phone, payload.wilaya, payload.commune, payload.address, payload.notes]
    );

    return result.rows[0];
  }

  async update(id, { name, wilaya, commune, address, notes }) {
    const payload = typeof name === 'object' && name !== null
      ? name.toPersistence()
      : { name, wilaya, commune, address, notes };

    const result = await this.pool.query(
      `
        UPDATE customers
        SET
          name = $1,
          wilaya = COALESCE($2, wilaya),
          commune = COALESCE($3, commune),
          address = COALESCE($4, address),
          notes = COALESCE($5, notes),
          updated_at = $6
        WHERE id = $7
        RETURNING *
      `,
      [payload.name, payload.wilaya, payload.commune, payload.address, payload.notes, new Date().toISOString(), id]
    );

    return result.rows[0] ?? null;
  }
}

module.exports = {
  PgCustomerRepository,
};
