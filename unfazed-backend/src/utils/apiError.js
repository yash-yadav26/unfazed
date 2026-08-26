/**
 * API Error Class
 *
 * Extends Error to provide structured error responses.
 * Supports error codes for frontend error handling.
 */

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    code = null,
    errors = []
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.code = code;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;