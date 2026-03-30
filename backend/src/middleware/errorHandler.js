'use strict';

const config = require('../config/env');

/**
 * Global Error Handler Middleware
 * Must be the LAST middleware registered in app.js
 * Catches all errors passed via next(err)
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log the error in development
  if (!config.isProd) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path}: ${err.message}`);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational
    ? err.message
    : config.isProd
    ? 'An unexpected error occurred'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.isProd ? {} : { stack: err.stack }),
  });
}

/**
 * Custom Operational Error class
 * Use this to throw expected errors (e.g., 404 Not Found)
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
