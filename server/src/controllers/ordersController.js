const pool = require('../config/db');
const format = require('pg-format');
const { triggerOrderStatusNotification } = require('./integrationsController');

// GET /api/orders
async function getOrders(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id/items
async function getOrderItems(req, res, next) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Helper: Fast Bulk Adjust Stock using PG-Format
async function adjustStock(client, items, direction) {
  // Aggregate quantities to prevent duplicate CTE matches
  const stockMap = {};
  for (const item of items) {
    if (!item.product_id) continue;
    stockMap[item.product_id] = (stockMap[item.product_id] || 0) + (item.quantity * direction);
  }

  const values = Object.entries(stockMap).map(([id, change]) => [id, change]);
  if (values.length === 0) return;

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
  
  // Hard fail if any product goes below 0 stock
  for (const row of rows) {
    if (row.stock < 0) {
      const err = new Error(`Insufficient stock for product: ${row.name || row.id}`);
      err.status = 400;
      throw err;
    }
  }
}

// POST /api/orders
async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { items, ...rawOrderData } = req.body;
    
    // Whitelist allowed columns to prevent SQL injection
    const allowedOrderFields = ['customer_name', 'customer_phone', 'customer_id', 'wilaya', 'commune', 'address', 'delivery_type', 'subtotal', 'shipping_cost', 'total', 'note', 'discount_code', 'discount_amount'];
    const orderData = {};
    for (const key of allowedOrderFields) {
      if (rawOrderData[key] !== undefined) orderData[key] = rawOrderData[key];
    }

    // Step 0: Security Validation (BE-ORD-02)
    // Server-side Price & Stock Tampering Prevention
    if (items && items.length > 0) {
      const productIds = items.map(i => i.product_id).filter(Boolean);
      if (productIds.length > 0) {
        const { rows: dbProducts } = await client.query('SELECT id, price FROM products WHERE id = ANY($1)', [productIds]);
        const priceMap = {};
        dbProducts.forEach(p => priceMap[p.id] = p.price);
        
        let realSubtotal = 0;
        for (const item of items) {
          if (!item.product_id) continue;
          const realPrice = priceMap[item.product_id] || 0;
          if (Math.abs(item.unit_price - realPrice) > 1) { // 1 dinar tolerance
             const err = new Error(`Price tampering detected for product ${item.product_name}. Expected ${realPrice}, got ${item.unit_price}`);
             err.status = 400;
             throw err;
          }
          realSubtotal += realPrice * item.quantity;
        }
        
        if (Math.abs(realSubtotal - orderData.subtotal) > 1) {
           const err = new Error(`Subtotal mismatch detected. Expected ${realSubtotal}, got ${orderData.subtotal}`);
           err.status = 400;
           throw err;
        }
        
        const expectedTotal = orderData.subtotal + (orderData.shipping_cost || 0) - (orderData.discount_amount || 0);
        if (Math.abs(expectedTotal - orderData.total) > 1) {
           const err = new Error(`Total mismatch detected. Check shipping or discounts.`);
           err.status = 400;
           throw err;
        }
      }
    }

    // Insert Order
    const orderCols = Object.keys(orderData);
    const orderVals = Object.values(orderData);
    const orderPlaceholders = orderCols.map((_, i) => `$${i + 1}`).join(', ');
    
    const { rows: orderRows } = await client.query(`
      INSERT INTO orders (${orderCols.join(', ')}) 
      VALUES (${orderPlaceholders}) 
      RETURNING *
    `, orderVals);
    
    const newOrder = orderRows[0];
    
    // Insert Items and adjust stock
    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        newOrder.id,
        item.product_id || null,
        item.product_name,
        item.quantity,
        item.unit_price,
        item.total
      ]);

      const itemsQuery = format(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total)
        VALUES %L
      `, itemValues);

      await client.query(itemsQuery);
      
      // Decrement stock efficiently
      await adjustStock(client, items, -1);
    }
    
    await client.query('COMMIT');
    
    // Webhook firing natively behind the scenes
    triggerOrderStatusNotification(newOrder.order_number, "new", {
      customer_name: newOrder.customer_name,
      customer_phone: newOrder.customer_phone,
      total: String(newOrder.total),
      address: newOrder.address || "",
      state: newOrder.wilaya || "",
    });
    
    res.status(201).json(newOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// PATCH /api/orders/:id/status
async function updateOrderStatus(req, res, next) {
  const { id } = req.params;
  const { status, call_attempts } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current order status
    const { rows: orderRows } = await client.query('SELECT status, call_attempts FROM orders WHERE id = $1', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const oldStatus = orderRows[0].status;
    let newCallAttempts = orderRows[0].call_attempts;
    
    if (status === 'attempt') {
      newCallAttempts = (newCallAttempts || 0) + 1;
    }
    
    // Update order
    const { rows: updatedOrderRows } = await client.query(
      'UPDATE orders SET status = $1, call_attempts = $2, updated_at = $3 WHERE id = $4 RETURNING *',
      [status, newCallAttempts, new Date().toISOString(), id]
    );
    const updatedOrder = updatedOrderRows[0];
    
    // Stock Logic
    const STOCK_CONSUMED_STATUSES = ["new", "attempt", "no_answer", "confirmed", "ready", "shipped", "delivered"];
    const STOCK_RESTORED_STATUSES = ["cancelled", "returned"];
    
    const wasConsumed = STOCK_CONSUMED_STATUSES.includes(oldStatus);
    const nowRestored = STOCK_RESTORED_STATUSES.includes(status);
    const wasRestored = STOCK_RESTORED_STATUSES.includes(oldStatus);
    const nowConsumed = STOCK_CONSUMED_STATUSES.includes(status);
    
    if (wasConsumed && nowRestored) {
      // Restore stock
      const { rows: items } = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
      await adjustStock(client, items, 1);
    } else if (wasRestored && nowConsumed) {
      // Re-decrement stock
      const { rows: items } = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
      await adjustStock(client, items, -1);
    }
    
    await client.query('COMMIT');
    
    triggerOrderStatusNotification(updatedOrder.order_number, status, {
      customer_name: updatedOrder.customer_name,
      customer_phone: updatedOrder.customer_phone,
      total: String(updatedOrder.total),
      address: updatedOrder.address || "",
      state: updatedOrder.wilaya || "",
      tracking_number: updatedOrder.tracking_number || "",
      shipping_company: updatedOrder.shipping_company || "",
    });
    
    res.json(updatedOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { getOrders, getOrderItems, createOrder, updateOrderStatus };
