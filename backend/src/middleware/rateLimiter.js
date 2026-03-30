'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Rate Limiter Middleware
 * Limits each IP to 100 requests per minute.
 * Returns 429 Too Many Requests when exceeded.
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,   // Return rate limit info in X-RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* legacy headers
  message: {
    success: false,
    error: 'Too many requests. Please wait before trying again.',
    retryAfter: `${config.rateLimit.windowMs / 1000} seconds`,
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

module.exports = { rateLimiter };
