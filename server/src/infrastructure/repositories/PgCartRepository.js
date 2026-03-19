const { ICartRepository } = require('../../domain/repositories/ICartRepository');

class PgCartRepository extends ICartRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findBySessionId(sessionId) {
    const result = await this.pool.query(
      'SELECT * FROM cart_items WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    return result.rows;
  }

  async findMatchingItem({ sessionId, productId, selectedOptions }) {
    const result = await this.pool.query(
      `
        SELECT id, quantity FROM cart_items
        WHERE session_id = $1 AND product_id = $2 AND selected_options = $3::jsonb
        LIMIT 1
      `,
      [sessionId, productId, JSON.stringify(selectedOptions)]
    );

    return result.rows[0] ?? null;
  }

  async createItem({
    sessionId,
    productId,
    productName,
    selectedOptions,
    productPrice,
    productImageUrl,
    quantity,
  }) {
    const result = await this.pool.query(
      `
        INSERT INTO cart_items (
          session_id,
          product_id,
          product_name,
          selected_options,
          product_price,
          product_image_url,
          quantity
        )
        VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
        RETURNING *
      `,
      [
        sessionId,
        productId,
        productName,
        JSON.stringify(selectedOptions),
        productPrice,
        productImageUrl,
        quantity,
      ]
    );

    return result.rows[0];
  }

  async updateQuantityById(id, quantity) {
    const result = await this.pool.query(
      `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING *
      `,
      [quantity, id]
    );

    return result.rows[0] ?? null;
  }

  async updateQuantityByIdAndSessionId(id, sessionId, quantity) {
    const result = await this.pool.query(
      `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2 AND session_id = $3
        RETURNING *
      `,
      [quantity, id, sessionId]
    );

    return result.rows[0] ?? null;
  }

  async deleteByIdAndSessionId(id, sessionId) {
    const result = await this.pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND session_id = $2',
      [id, sessionId]
    );

    return result.rowCount > 0;
  }

  async clearBySessionId(sessionId) {
    await this.pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
  }
}

module.exports = {
  PgCartRepository,
};
