const pool = require('../config/db');

// --- ADMIN ROUTES ---

// GET /api/discounts
async function getDiscounts(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM discounts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/discounts
async function createDiscount(req, res, next) {
  try {
    const d = req.body;
    
    if (!d.code || !d.type || d.value === undefined) {
      return res.status(400).json({ error: 'Code, type, and value are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO discounts (
        code, type, value, usage_limit, active, expires_at, 
        apply_to, product_ids, quantity_behavior, min_quantity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      d.code, 
      d.type, 
      d.value, 
      d.usage_limit || null, 
      d.active ?? true, 
      d.expires_at || null,
      d.apply_to || 'all',
      d.product_ids || [],
      d.quantity_behavior || 'all',
      d.min_quantity || 1
    ]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation for code
        return res.status(409).json({ error: 'Discount code already exists' });
    }
    next(err);
  }
}

// PATCH /api/discounts/:id
async function updateDiscount(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const allowedFields = ['code', 'type', 'value', 'usage_limit', 'active', 'expires_at', 'apply_to', 'product_ids', 'quantity_behavior', 'min_quantity'];
    const setClause = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) continue;
      setClause.push(`${key} = $${queryIndex}`);
      values.push(value);
      queryIndex++;
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    setClause.push(`updated_at = $${queryIndex}`);
    values.push(new Date().toISOString());
    queryIndex++;

    values.push(id);

    const query = `
      UPDATE discounts 
      SET ${setClause.join(', ')} 
      WHERE id = $${queryIndex} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation for code
        return res.status(409).json({ error: 'Discount code already exists' });
    }
    next(err);
  }
}

// DELETE /api/discounts/:id
async function deleteDiscount(req, res, next) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM discounts WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// --- PUBLIC STOREFRONT ROUTES ---

// POST /api/discounts/validate
// Body: { code: string }
async function validateDiscount(req, res, next) {
  try {
    let { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    code = code.trim().toUpperCase();

    const { rows } = await pool.query(`
      SELECT * FROM discounts 
      WHERE code = $1 AND active = true 
      LIMIT 1
    `, [code]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid discount code' });
    }

    const discount = rows[0];

    // Check expiry
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Discount code expired' });
    }

    // Check usage limit
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return res.status(400).json({ error: 'Usage limit reached' });
    }

    res.json(discount);
  } catch (err) {
    next(err);
  }
}

// POST /api/discounts/:id/increment
// Increments the usage_count by 1
async function incrementDiscountUsage(req, res, next) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(`
      UPDATE discounts 
      SET usage_count = usage_count + 1 
      WHERE id = $1 
      RETURNING usage_count
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getDiscounts, 
  createDiscount, 
  updateDiscount, 
  deleteDiscount, 
  validateDiscount, 
  incrementDiscountUsage 
};
