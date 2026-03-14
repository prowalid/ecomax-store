const pool = require('../config/db');
const { normalizeSelectedOptions } = require('../utils/normalizeSelectedOptions');

function isValidSessionId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{16,128}$/.test(value);
}

// GET /api/cart/:sessionId
async function getCartItems(req, res, next) {
  const { sessionId } = req.params;
  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM cart_items WHERE session_id = $1 ORDER BY created_at ASC', [sessionId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/cart
// Request body: { session_id, product_id, product_name, selected_options, product_price, product_image_url, quantity }
async function addOrUpdateCartItem(req, res, next) {
  try {
    const { session_id, product_id, product_name, product_price, product_image_url, quantity } = req.body;
    const selected_options = normalizeSelectedOptions(req.body.selected_options);
    if (!isValidSessionId(session_id)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Check if item exists in this session
    const { rows: existingRows } = await pool.query(`
      SELECT id, quantity FROM cart_items 
      WHERE session_id = $1 AND product_id = $2 AND selected_options = $3::jsonb
      LIMIT 1
    `, [session_id, product_id, JSON.stringify(selected_options)]);

    if (existingRows.length > 0) {
      // Update quantity
      const existing = existingRows[0];
      const newQuantity = existing.quantity + (quantity || 1);
      
      const { rows } = await pool.query(`
        UPDATE cart_items 
        SET quantity = $1 
        WHERE id = $2 
        RETURNING *
      `, [newQuantity, existing.id]);
      
      return res.json(rows[0]);
    }

    // Insert new item
    const { rows } = await pool.query(`
      INSERT INTO cart_items (session_id, product_id, product_name, selected_options, product_price, product_image_url, quantity)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
      RETURNING *
    `, [session_id, product_id, product_name, JSON.stringify(selected_options), product_price, product_image_url || null, quantity || 1]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/cart/:itemId
// Request body: { quantity }
async function updateCartItemQuantity(req, res, next) {
  const { itemId } = req.params;
  const { quantity, session_id } = req.body;
  if (!isValidSessionId(session_id)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    if (quantity <= 0) {
      // Delete if quantity 0
      const { rowCount } = await pool.query('DELETE FROM cart_items WHERE id = $1 AND session_id = $2', [itemId, session_id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      return res.status(204).send();
    }

    const { rows } = await pool.query(`
      UPDATE cart_items 
      SET quantity = $1 
      WHERE id = $2 AND session_id = $3
      RETURNING *
    `, [quantity, itemId, session_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/:itemId
async function deleteCartItem(req, res, next) {
  const { itemId } = req.params;
  const session_id = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!isValidSessionId(session_id)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }
  try {
    const { rowCount } = await pool.query('DELETE FROM cart_items WHERE id = $1 AND session_id = $2', [itemId, session_id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/session/:sessionId
async function clearCart(req, res, next) {
  const { sessionId } = req.params;
  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }
  try {
    await pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getCartItems, 
  addOrUpdateCartItem, 
  updateCartItemQuantity, 
  deleteCartItem, 
  clearCart 
};
