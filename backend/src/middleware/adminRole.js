'use strict';

/**
 * Admin Role Middleware
 * Must be used AFTER authenticate middleware.
 * Checks user metadata for admin role — returns 403 if not admin.
 *
 * To grant admin access, run in Supabase SQL Editor:
 *   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
 *   WHERE id = 'your-user-uuid';
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const role = req.user.app_metadata?.role;

  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Admin role required',
    });
  }

  next();
}

module.exports = { requireAdmin };
