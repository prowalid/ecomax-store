const pool = require('../config/db');
const format = require('pg-format');
const { triggerOrderStatusNotification, sendOrderWebhook, buildOrderWebhookPayload } = require('./integrationsController');
const { getShippingSettings } = require('../services/shipping/shippingSettings');
const { createYalidineShipment, createGuepexShipment } = require('../services/shipping/providers/yalidineProvider');
const { normalizeSelectedOptions } = require('../utils/normalizeSelectedOptions');

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

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function formatNotificationItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "—";
  return items
    .map((item) => `${item.product_name} × ${item.quantity}`)
    .join("، ");
}

async function getOrderWithItems(orderId) {
  const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [orderId]);
  if (orderRows.length === 0) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  const { rows: itemRows } = await pool.query(
    'SELECT id, order_id, product_id, product_name, selected_options, quantity, unit_price, total FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
    [orderId]
  );

  return { order: orderRows[0], items: itemRows };
}

// POST /api/orders
async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { items, ...rawOrderData } = req.body;

    const requestedQtyByProduct = {};
    for (const item of items) {
      requestedQtyByProduct[item.product_id] = (requestedQtyByProduct[item.product_id] || 0) + item.quantity;
    }
    const productIds = Object.keys(requestedQtyByProduct);
    const { rows: dbProducts } = await client.query(
      'SELECT id, name, price, stock FROM products WHERE id = ANY($1) FOR UPDATE',
      [productIds]
    );

    if (dbProducts.length !== productIds.length) {
      const err = new Error('One or more products are missing.');
      err.status = 400;
      throw err;
    }

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));
    let computedSubtotal = 0;
    const normalizedItems = items.map((item) => {
      const dbProduct = dbProductMap.get(item.product_id);
      if (!dbProduct) {
        const err = new Error(`Product not found: ${item.product_id}`);
        err.status = 400;
        throw err;
      }

      if (dbProduct.stock < requestedQtyByProduct[item.product_id]) {
        const err = new Error(`Insufficient stock for product: ${dbProduct.name}`);
        err.status = 400;
        throw err;
      }

      const unitPrice = asNumber(dbProduct.price, 0);
      const lineTotal = unitPrice * item.quantity;
      computedSubtotal += lineTotal;

      return {
        product_id: item.product_id,
        product_name: dbProduct.name,
        selected_options: normalizeSelectedOptions(item.selected_options),
        quantity: item.quantity,
        unit_price: unitPrice,
        total: lineTotal,
      };
    });

    const shippingCost = Math.max(0, asNumber(rawOrderData.shipping_cost, 0));
    const finalTotal = Math.max(0, round2(computedSubtotal + shippingCost));

    // Whitelist allowed columns and inject server-side computed totals.
    const allowedOrderFields = ['customer_name', 'customer_phone', 'customer_id', 'wilaya', 'commune', 'address', 'delivery_type', 'note', 'ip_address'];
    const orderData = {};
    for (const key of allowedOrderFields) {
      if (rawOrderData[key] !== undefined) orderData[key] = rawOrderData[key];
    }
    orderData.subtotal = computedSubtotal;
    orderData.shipping_cost = shippingCost;
    orderData.total = finalTotal;
    orderData.ip_address = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) || req.ip;

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
    if (normalizedItems.length > 0) {
      const itemValues = normalizedItems.map(item => [
        newOrder.id,
        item.product_id,
        item.product_name,
        JSON.stringify(item.selected_options || {}),
        item.quantity,
        item.unit_price,
        item.total
      ]);

      const itemsQuery = format(`
        INSERT INTO order_items (order_id, product_id, product_name, selected_options, quantity, unit_price, total)
        VALUES %L
      `, itemValues);

      await client.query(itemsQuery);
      
      // Decrement stock efficiently
      await adjustStock(client, normalizedItems, -1);
    }
    
    await client.query('COMMIT');
    
    const webhookPayload = buildOrderWebhookPayload('order.created', newOrder, normalizedItems, {
      trigger: 'order_create',
    });

    void sendOrderWebhook('order.created', webhookPayload);

    triggerOrderStatusNotification(newOrder.order_number, "new", {
      customer_name: newOrder.customer_name,
      customer_phone: newOrder.customer_phone,
      total: String(newOrder.total),
      address: newOrder.address || "",
      state: newOrder.wilaya || "",
      items: formatNotificationItems(normalizedItems),
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

    const { rows: orderItems } = await pool.query(
      'SELECT product_id, product_name, selected_options, quantity, unit_price, total FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const webhookPayload = buildOrderWebhookPayload('order.status_updated', updatedOrder, orderItems, {
      trigger: 'order_status_update',
      previous_status: oldStatus,
      current_status: status,
    });

    void sendOrderWebhook('order.status_updated', webhookPayload);
    
    triggerOrderStatusNotification(updatedOrder.order_number, status, {
      customer_name: updatedOrder.customer_name,
      customer_phone: updatedOrder.customer_phone,
      total: String(updatedOrder.total),
      address: updatedOrder.address || "",
      state: updatedOrder.wilaya || "",
      tracking_number: updatedOrder.tracking_number || "",
      shipping_company: updatedOrder.shipping_company || "",
      items: formatNotificationItems(orderItems),
    });
    
    res.json(updatedOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

const SHIPPING_PROVIDER_HANDLERS = {
  yalidine: {
    label: 'Yalidine',
    settingsKey: 'yalidine',
    createShipment: createYalidineShipment,
  },
  guepex: {
    label: 'Guepex',
    settingsKey: 'guepex',
    createShipment: createGuepexShipment,
  },
};

// POST /api/orders/:id/shipping/provider
async function createOrderShipment(req, res, next) {
  try {
    const { id } = req.params;
    const { order, items } = await getOrderWithItems(id);
    const shippingSettings = await getShippingSettings();
    const activeProvider = shippingSettings.provider?.active_provider;
    const providerConfig = SHIPPING_PROVIDER_HANDLERS[activeProvider];

    if (!providerConfig) {
      return res.status(400).json({ error: 'لا يوجد مزود شحن مباشر مفعل حاليًا' });
    }

    if (order.shipping_company === providerConfig.settingsKey && order.tracking_number) {
      return res.status(409).json({ error: `تم رفع هذا الطلب إلى ${providerConfig.label} مسبقًا` });
    }

    const shipment = await providerConfig.createShipment({
      order,
      items,
      settings: shippingSettings[providerConfig.settingsKey] || {},
    });

    const { rows } = await pool.query(
      `
        UPDATE orders
        SET shipping_company = $1,
            tracking_number = COALESCE($2, tracking_number),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `,
      [providerConfig.settingsKey, shipment.tracking_number, id]
    );

    res.json({
      success: true,
      provider: providerConfig.settingsKey,
      provider_label: providerConfig.label,
      tracking_number: shipment.tracking_number,
      order: rows[0],
      shipment_response: shipment.response,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOrders, getOrderItems, createOrder, updateOrderStatus, createOrderShipment };
