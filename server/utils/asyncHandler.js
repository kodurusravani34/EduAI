/**
 * ============================================
 *  Async Handler Utility
 * ============================================
 *  Wraps async route handlers so that rejected
 *  promises are automatically forwarded to the
 *  Express error-handling middleware.
 *
 *  Usage: router.get('/path', asyncHandler(myController))
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
