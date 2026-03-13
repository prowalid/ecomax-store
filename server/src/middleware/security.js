const axios = require('axios');
const pool = require('../config/db');

/**
 * Unified Security & Bot Protection Middleware
 * Handles:
 * 1. Honey Pot verification
 * 2. Cloudflare Turnstile verification (if enabled)
 */
async function validateBotProtection(req, res, next) {
  try {
    // 1. Fetch current security settings
    const { rows: settingRows } = await pool.query('SELECT value FROM store_settings WHERE key = $1 LIMIT 1', ['security']);
    const security = settingRows[0]?.value || { turnstile_enabled: false, honeypot_enabled: true };

    const customerPhone = req.body.customer_phone;
    const clientIp = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) || req.ip;

    // 2. Blacklist Check (IP & Phone)
    const { rows: blacklistRows } = await pool.query(
      'SELECT type, value FROM blacklist WHERE (type = $1 AND value = $2) OR (type = $3 AND value = $4)',
      ['ip', clientIp, 'phone', customerPhone]
    );

    if (blacklistRows.length > 0) {
      console.log(`[Security] Blocked request from blacklisted ${blacklistRows[0].type}: ${blacklistRows[0].value}`);
      return res.status(403).json({ 
        error: 'Access denied. Your information is blacklisted.', 
        code: 'BLACKLISTED' 
      });
    }
    
    // 2.1 Duplicate Order Check (Spam Prevention)
    // Check if there's an order with same phone or IP in the last 5 minutes
    const { rows: recentOrders } = await pool.query(
      `SELECT id FROM orders 
       WHERE (customer_phone = $1 OR ip_address = $2)
       AND created_at > NOW() - INTERVAL '5 minutes'
       LIMIT 1`,
      [customerPhone, clientIp]
    );

    if (recentOrders.length > 0) {
      console.log(`[Security] Blocked duplicate order attempt from IP: ${clientIp} or Phone: ${customerPhone}`);
      return res.status(429).json({
        error: 'لديك طلب قيد المعالجة بالفعل. يرجى الانتظار 5 دقائق قبل إرسال طلب جديد.',
        code: 'DUPLICATE_ORDER'
      });
    }

    // 3. Algerian Phone Validation
    if (customerPhone) {
      const phoneRegex = /^0[5-7][0-9]{8}$/;
      if (!phoneRegex.test(customerPhone)) {
        return res.status(400).json({ 
          error: 'رقم الهاتف غير صالح. يجب أن يكون رقم جزائري صحيح (05/06/07).', 
          code: 'INVALID_PHONE' 
        });
      }
    }

    // 4. Honey Pot Check
    if (req.body.website_url) {
      console.log('[Security] Honey Pot triggered. Blocking request.');
      return res.status(400).json({ 
        error: 'Bot activity detected.', 
        code: 'BOT_DETECTED_HONEYPOT' 
      });
    }

    // 5. Turnstile Check
    if (security.turnstile_enabled && security.secret_key) {
      const token = req.body['cf-turnstile-response'];

      if (!token) {
        return res.status(400).json({ 
          error: 'Security verification failed. Please refresh and try again.',
          code: 'MISSING_TURNSTILE_TOKEN'
        });
      }

      // Verify with Cloudflare
      const cfResponse = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        new URLSearchParams({
          secret: security.secret_key,
          response: token,
          remoteip: req.ip,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!cfResponse.data.success) {
        console.log('[Security] Turnstile verification failed:', cfResponse.data['error-codes']);
        return res.status(400).json({ 
          error: 'Security verification failed. Are you a robot?',
          code: 'INVALID_TURNSTILE_TOKEN'
        });
      }
    }

    // All checks passed
    next();
  } catch (err) {
    console.error('[Security Error]', err);
    // On server error, we fail open to not block real users, or fail closed? 
    // Usually, security failure should not block orders if it's the server's fault.
    next(); 
  }
}

module.exports = { validateBotProtection };
