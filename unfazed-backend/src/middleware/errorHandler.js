/**
 * Global API Error Handler
 *
 * Converts application errors into a consistent
 * JSON response for the frontend.
 */

const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode = error?.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: error?.message || "Internal server error.",
    code: error?.code || null,
    errors: Array.isArray(error?.errors) ? error.errors : [],
  });
};

module.exports = errorHandler;
