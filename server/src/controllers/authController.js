const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if any admin already exists (registration locked after first admin)
    const { rows: existing } = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existing[0].count) > 0) {
      return res.status(403).json({ error: 'Registration is closed. An admin already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email.toLowerCase().trim(), passwordHash, 'admin']
    );

    const user = rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin account created successfully.',
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/setup-status
async function checkSetupStatus(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    const hasAdmin = parseInt(rows[0].count) > 0;
    res.json({ hasAdmin });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, checkSetupStatus };
