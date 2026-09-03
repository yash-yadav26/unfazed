import api from "./axios";

/* =========================================================
   GET ANALYTICS OVERVIEW
========================================================= */

/*
 * Returns:
 * - revenue
 * - activeClients
 */

export const getAnalyticsOverview = async () => {
  const response = await api.get("/analytics/overview");

  return response.data;
};

/* =========================================================
   GET REVENUE TREND
========================================================= */

/*
 * Returns month-wise paid revenue.
 */

export const getRevenueTrend = async () => {
  const response = await api.get("/analytics/revenue");

  return response.data;
};

/* =========================================================
   GET CLIENT ANALYTICS
========================================================= */

/*
 * Returns:
 * - totalClients
 * - activeClients
 * - newClients
 */

export const getClientAnalytics = async () => {
  const response = await api.get("/analytics/clients");

  return response.data;
};


