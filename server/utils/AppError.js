/**
 * ============================================
 *  AppError Utility
 * ============================================
 *  Custom operational error class.
 *  Thrown intentionally in controllers/services
 *  and caught by the global error handler.
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
