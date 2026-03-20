const format = require('pg-format');
const { IOrderRepository } = require('../../domain/repositories/IOrderRepository');

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

class PgOrderRepository extends IOrderRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async listAll() {
    const { rows } = await this.pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    return rows;
  }

  async list({ search, status, page = 1, limit = 20, paginate = false } = {}) {
    const clauses = [];
    const values = [];

    if (status && status !== 'all') {
      values.push(status);
      clauses.push(`status = $${values.length}`);
    }

    if (search && search.trim()) {
      const needle = `%${search.trim()}%`;
      values.push(needle);
      const placeholder = `$${values.length}`;
      clauses.push(`(
        customer_name ILIKE ${placeholder}
        OR customer_phone ILIKE ${placeholder}
        OR CAST(order_number AS TEXT) ILIKE ${placeholder}
        OR COALESCE(ip_address, '') ILIKE ${placeholder}
        OR COALESCE(tracking_number, '') ILIKE ${placeholder}
        OR COALESCE(shipping_company, '') ILIKE ${placeholder}
        OR COALESCE(wilaya, '') ILIKE ${placeholder}
        OR COALESCE(commune, '') ILIKE ${placeholder}
      )`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    if (!paginate) {
      const { rows } = await this.pool.query(
        `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC`,
        values
      );
      return rows;
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM orders ${whereClause}`,
      values
    );
    const total = countResult.rows[0]?.total ?? 0;

    const pagedValues = [...values, safeLimit, offset];
    const { rows } = await this.pool.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${pagedValues.length - 1} OFFSET $${pagedValues.length}`,
      pagedValues
    );

    return {
      items: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        hasNextPage: offset + rows.length < total,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async findById(orderId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM orders WHERE id = $1 LIMIT 1',
      [orderId]
    );

    return rows[0] || null;
  }

  async findItemsByOrderId(orderId) {
    const { rows } = await this.pool.query(
      'SELECT id, order_id, product_id, product_name, selected_options, quantity, unit_price, total FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId]
    );

    return rows;
  }

  async findAllItemsByOrderId(orderId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    return rows;
  }

  async withTransaction(callback) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getStatusSnapshot(client, orderId) {
    const { rows } = await client.query(
      'SELECT status, call_attempts FROM orders WHERE id = $1',
      [orderId]
    );

    return rows[0] || null;
  }

  async lockProducts(client, productIds) {
    const { rows } = await client.query(
      'SELECT id, name, price, stock FROM products WHERE id = ANY($1) FOR UPDATE',
      [productIds]
    );

    return rows;
  }

  async createOrder(client, orderData) {
    const payload = typeof orderData?.toPersistence === 'function'
      ? orderData.toPersistence()
      : orderData;
    const columns = Object.keys(payload);
    const values = Object.values(payload);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const { rows } = await client.query(
      `INSERT INTO orders (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return rows[0];
  }

  async insertOrderItems(client, orderId, items) {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    const values = items.map((item) => [
      orderId,
      item.product_id,
      item.product_name,
      JSON.stringify(item.selected_options || {}),
      item.quantity,
      item.unit_price,
      item.total,
    ]);

    const query = format(`
      INSERT INTO order_items (order_id, product_id, product_name, selected_options, quantity, unit_price, total)
      VALUES %L
    `, values);

    await client.query(query);
  }

  calculateOrderDraft({ rawOrderData, items, productsById, requestIp }) {
    const requestedQtyByProduct = {};

    for (const item of items) {
      requestedQtyByProduct[item.product_id] = (requestedQtyByProduct[item.product_id] || 0) + item.quantity;
    }

    let computedSubtotal = 0;
    const normalizedItems = items.map((item) => {
      const dbProduct = productsById.get(item.product_id);
      if (!dbProduct) {
        const error = new Error(`Product not found: ${item.product_id}`);
        error.status = 400;
        throw error;
      }

      if (dbProduct.stock < requestedQtyByProduct[item.product_id]) {
        const error = new Error(`Insufficient stock for product: ${dbProduct.name}`);
        error.status = 400;
        throw error;
      }

      const unitPrice = asNumber(dbProduct.price, 0);
      const lineTotal = unitPrice * item.quantity;
      computedSubtotal += lineTotal;

      return {
        product_id: item.product_id,
        product_name: dbProduct.name,
        selected_options: item.selected_options,
        quantity: item.quantity,
        unit_price: unitPrice,
        total: lineTotal,
      };
    });

    const shippingCost = Math.max(0, asNumber(rawOrderData.shipping_cost, 0));
    const finalTotal = Math.max(0, round2(computedSubtotal + shippingCost));

    const allowedOrderFields = [
      'customer_name',
      'customer_phone',
      'customer_id',
      'wilaya',
      'commune',
      'address',
      'delivery_type',
      'note',
      'ip_address',
    ];

    const orderData = {};
    for (const key of allowedOrderFields) {
      if (rawOrderData[key] !== undefined) {
        orderData[key] = rawOrderData[key];
      }
    }

    orderData.subtotal = computedSubtotal;
    orderData.shipping_cost = shippingCost;
    orderData.total = finalTotal;
    orderData.ip_address = requestIp;

    return {
      orderData,
      normalizedItems,
    };
  }

  async updateStatus(client, orderId, { status, callAttempts }) {
    const { rows } = await client.query(
      'UPDATE orders SET status = $1, call_attempts = $2, updated_at = $3 WHERE id = $4 RETURNING *',
      [status, callAttempts, new Date().toISOString(), orderId]
    );

    return rows[0] || null;
  }

  async getOrderItems(client, orderId) {
    const { rows } = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    return rows;
  }

  async getDetailedOrderItems(client, orderId) {
    const { rows } = await client.query(
      'SELECT product_id, product_name, selected_options, quantity, unit_price, total FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId]
    );

    return rows;
  }

  async hasRecentOrderAttempt({ customerPhone, ipAddress, withinMinutes = 5 }) {
    const { rows } = await this.pool.query(
      `SELECT id
       FROM orders
       WHERE (customer_phone = $1 OR ip_address = $2)
         AND created_at > NOW() - ($3::text || ' minutes')::interval
       LIMIT 1`,
      [customerPhone, ipAddress, String(withinMinutes)]
    );

    return rows.length > 0;
  }

  async updateShipmentInfo(orderId, { shippingCompany, trackingNumber, shippingLabelUrl }) {
    const { rows } = await this.pool.query(
      `
        UPDATE orders
        SET shipping_company = $1,
            tracking_number = COALESCE($2, tracking_number),
            shipping_label_url = COALESCE($3, shipping_label_url),
            updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `,
      [shippingCompany, trackingNumber, shippingLabelUrl, orderId]
    );

    return rows[0] || null;
  }

  async adjustStock(client, items, direction) {
    const stockMap = {};

    for (const item of items) {
      if (!item.product_id) continue;
      stockMap[item.product_id] = (stockMap[item.product_id] || 0) + (item.quantity * direction);
    }

    const values = Object.entries(stockMap).map(([id, change]) => [id, change]);
    if (values.length === 0) return [];

    const query = format(`
      UPDATE products AS p
      SET
        stock = p.stock + (v.quantity_change::int),
        updated_at = NOW()
      FROM (VALUES %L) AS v(product_id, quantity_change)
      WHERE p.id = v.product_id::uuid
      RETURNING p.id, p.name, p.stock
    `, values);

    const { rows } = await client.query(query);
    return rows;
  }
}

module.exports = {
  PgOrderRepository,
};
