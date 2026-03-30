'use strict';

const { verifySupabaseJWT } = require('../config/supabase');

/**
 * Authentication Middleware
 * Verifies Supabase JWT from Authorization: Bearer <token>
 * Attaches req.user on success, returns 401 on failure.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];
    const { user, error } = await verifySupabaseJWT(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
