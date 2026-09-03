const express = require("express");

const {
  getAnalyticsOverview,
  getRevenueTrend,
  getClientAnalytics,
} = require("../controllers/therapistAnalytics.controller");

const authMiddleware = require("../../../middleware/authMiddleware");

const {
  validateAnalyticsQuery,
} = require("../validations/therapistAnalytics.validation");

const router = express.Router();

/* =========================================================
   SWAGGER TAG
========================================================= */

/**
 * @swagger
 * tags:
 *   name: Therapist Analytics
 *   description: Therapist practice analytics APIs
 */

/* =========================================================
   ANALYTICS OVERVIEW
========================================================= */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Get therapist analytics overview
 *     description: Returns total paid revenue and active client count for the authenticated therapist.
 *     tags: [Therapist Analytics]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Analytics overview fetched successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Therapist profile not found
 *
 *       500:
 *         description: Internal server error
 */

router.get(
  "/overview",
  authMiddleware,
  validateAnalyticsQuery,
  getAnalyticsOverview,
);

/* =========================================================
   REVENUE TREND
========================================================= */

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     summary: Get therapist revenue trend
 *     description: Returns month-wise paid revenue for the authenticated therapist.
 *     tags: [Therapist Analytics]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Revenue analytics fetched successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Therapist profile not found
 *
 *       500:
 *         description: Internal server error
 */

router.get("/revenue", authMiddleware, validateAnalyticsQuery, getRevenueTrend);

/* =========================================================
   CLIENT ANALYTICS
========================================================= */

/**
 * @swagger
 * /api/analytics/clients:
 *   get:
 *     summary: Get therapist client analytics
 *     description: Returns total, active and new client metrics.
 *     tags: [Therapist Analytics]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Client analytics fetched successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Therapist profile not found
 *
 *       500:
 *         description: Internal server error
 */

router.get(
  "/clients",
  authMiddleware,
  validateAnalyticsQuery,
  getClientAnalytics,
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
