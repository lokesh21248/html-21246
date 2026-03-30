'use strict';

/**
 * Wraps an async route handler to catch errors and forward to errorHandler.
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someService.getAll();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
