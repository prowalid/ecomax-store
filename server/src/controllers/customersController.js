const pool = require('../config/db');

// GET /api/customers
async function getCustomers(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/customers
// Used by storefront checkout to save customer details
async function createOrUpdateCustomer(req, res, next) {
  try {
    const { name, phone, wilaya, commune, address, notes } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if customer with same phone exists (phone isn't UNIQUE at DB level yet)
    const { rows: existingRows } = await pool.query('SELECT id FROM customers WHERE phone = $1 LIMIT 1', [phone]);

    if (existingRows.length > 0) {
      // Update existing customer
      const existingId = existingRows[0].id;
      const { rows: updatedRows } = await pool.query(`
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
      `, [name, wilaya || null, commune || null, address || null, notes || null, new Date().toISOString(), existingId]);
      
      return res.json(updatedRows[0]);
    }

    // Create new customer
    const { rows: newRows } = await pool.query(`
      INSERT INTO customers (name, phone, wilaya, commune, address, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, phone, wilaya || null, commune || null, address || null, notes || null]);

    res.status(201).json(newRows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCustomers, createOrUpdateCustomer };
