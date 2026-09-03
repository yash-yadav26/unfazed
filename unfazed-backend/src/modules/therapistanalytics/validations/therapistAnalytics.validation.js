const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

/* =========================================================
   ANALYTICS QUERY VALIDATION
========================================================= */

/*
 * Current analytics APIs ko kisi query parameter ki
 * requirement nahi hai.
 *
 * Example:
 *
 * GET /api/analytics/overview
 * GET /api/analytics/revenue
 * GET /api/analytics/clients
 *
 * Agar future mein date range ya filter add karna ho,
 * isi schema ko extend kiya ja sakta hai.
 */

const analyticsQuerySchema = z.object({}).strict();

/* =========================================================
   VALIDATE ANALYTICS QUERY
========================================================= */

const validateAnalyticsQuery = (req, res, next) => {
  const result = analyticsQuerySchema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return next(
      new ApiError(400, "Validation failed.", "VALIDATION_ERROR", errors),
    );
  }

  req.validatedQuery = result.data;

  next();
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  validateAnalyticsQuery,
};
