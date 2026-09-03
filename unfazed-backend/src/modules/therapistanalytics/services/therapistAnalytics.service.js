const Therapist = require("../../therapist/models/therapist.model");

const therapistAnalyticsRepository = require("../repositories/therapistAnalytics.repository");

const ApiError = require("../../../utils/apiError");

/* =========================================================
   GET THERAPIST PROFILE
========================================================= */

/*
 * JWT se req.user.id milta hai.
 *
 * Lekin Session aur Payment mein therapistId ke andar
 * Therapist document ka _id stored hai.
 *
 * Isliye userId ke through Therapist find karenge.
 */

const getTherapistByUserId = async (userId) => {
  const therapist = await Therapist.findOne({
    userId,
  }).lean();

  if (!therapist) {
    throw new ApiError(404, "Therapist profile not found.");
  }

  return therapist;
};

/* =========================================================
   ANALYTICS OVERVIEW SERVICE
========================================================= */

/*
 * Returns:
 *
 * - Total Revenue
 * - Active Clients
 */

const getAnalyticsOverviewService = async (userId) => {
  const therapist = await getTherapistByUserId(userId);

  const overview = await therapistAnalyticsRepository.getAnalyticsOverview(
    therapist._id,
  );

  return {
    revenue: overview.revenue,
    activeClients: overview.activeClients,
  };
};

/* =========================================================
   REVENUE TREND SERVICE
========================================================= */

/*
 * Therapist ka month-wise paid revenue.
 */

const getRevenueTrendService = async (userId) => {
  const therapist = await getTherapistByUserId(userId);

  const revenueTrend = await therapistAnalyticsRepository.getRevenueTrend(
    therapist._id,
  );

  return revenueTrend;
};

/* =========================================================
   CLIENT ANALYTICS SERVICE
========================================================= */

/*
 * Returns:
 *
 * - Total Clients
 * - Active Clients
 * - New Clients
 */

const getClientAnalyticsService = async (userId) => {
  const therapist = await getTherapistByUserId(userId);

  const clientAnalytics = await therapistAnalyticsRepository.getClientAnalytics(
    therapist._id,
  );

  return {
    totalClients: clientAnalytics.totalClients,
    activeClients: clientAnalytics.activeClients,
    newClients: clientAnalytics.newClients,
  };
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  getAnalyticsOverviewService,
  getRevenueTrendService,
  getClientAnalyticsService,
};
