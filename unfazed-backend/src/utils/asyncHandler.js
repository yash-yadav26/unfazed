/**
 * Async Handler Utility
 *
 * Wraps async controller functions and forwards errors
 * to Express global error middleware.
 */

const asyncHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = asyncHandler;