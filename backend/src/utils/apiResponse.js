'use strict';

/**
 * Standardized API Response Helpers
 * Ensures consistent response shape across all endpoints.
 */

/**
 * Send a successful response
 * @param {object} res - Express response object
 * @param {any} data - Response payload
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} meta - Optional metadata (pagination, etc.)
 */
function sendSuccess(res, data, statusCode = 200, meta = {}) {
  const response = {
    success: true,
    data,
  };

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = { sendSuccess, sendError };
