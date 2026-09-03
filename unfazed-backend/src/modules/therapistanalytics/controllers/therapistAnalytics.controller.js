const asyncHandler = require("../../../utils/asyncHandler.js");

const ApiResponse = require("../../../utils/apiResponse.js");

const therapistAnalyticsService = require("../services/therapistAnalytics.service");

/* =========================================================
   GET ANALYTICS OVERVIEW
========================================================= */

/*
 * GET /analytics/overview
 *
 * Returns:
 * - Revenue
 * - Active Clients
 */

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const analytics = await therapistAnalyticsService.getAnalyticsOverviewService(
    req.user.id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        "Analytics overview fetched successfully.",
      ),
    );
});

/* =========================================================
   GET REVENUE TREND
========================================================= */

/*
 * GET /analytics/revenue
 *
 * Returns month-wise paid revenue.
 */

const getRevenueTrend = asyncHandler(async (req, res) => {
  const revenueTrend = await therapistAnalyticsService.getRevenueTrendService(
    req.user.id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        revenueTrend,
        "Revenue analytics fetched successfully.",
      ),
    );
});

/* =========================================================
   GET CLIENT ANALYTICS
========================================================= */

/*
 * GET /analytics/clients
 *
 * Returns:
 * - Total Clients
 * - Active Clients
 * - New Clients
 */

const getClientAnalytics = asyncHandler(async (req, res) => {
  const clientAnalytics =
    await therapistAnalyticsService.getClientAnalyticsService(req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        clientAnalytics,
        "Client analytics fetched successfully.",
      ),
    );
});

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  getAnalyticsOverview,
  getRevenueTrend,
  getClientAnalytics,
};
