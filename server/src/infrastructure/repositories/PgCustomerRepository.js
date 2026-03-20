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

  async list({ search, page = 1, limit = 20, paginate = false } = {}) {
    const clauses = [];
    const values = [];

    if (search && search.trim()) {
      const needle = `%${search.trim()}%`;
      values.push(needle);
      const placeholder = `$${values.length}`;
      clauses.push(`(
        name ILIKE ${placeholder}
        OR phone ILIKE ${placeholder}
        OR COALESCE(wilaya, '') ILIKE ${placeholder}
        OR COALESCE(commune, '') ILIKE ${placeholder}
      )`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    if (!paginate) {
      const result = await this.pool.query(
        `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC`,
        values
      );
      return result.rows;
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM customers ${whereClause}`,
      values
    );
    const total = countResult.rows[0]?.total ?? 0;

    const pagedValues = [...values, safeLimit, offset];
    const result = await this.pool.query(
      `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${pagedValues.length - 1} OFFSET $${pagedValues.length}`,
      pagedValues
    );

    return {
      items: result.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        hasNextPage: offset + result.rows.length < total,
        hasPreviousPage: safePage > 1,
      },
    };
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
