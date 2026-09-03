const Session = require("../../session/models/session.model");
const Payment = require("../../payment/models/payment.model");

/* =========================================================
   ANALYTICS OVERVIEW
========================================================= */

/*
 * Therapist ke overview metrics:
 *
 * 1. Total Revenue
 * 2. Active Clients
 */

const getAnalyticsOverview = async (therapistId) => {
  /* -------------------------------------------------------
     TOTAL REVENUE
  ------------------------------------------------------- */

  const revenueResult = await Payment.aggregate([
    {
      $match: {
        therapistId,
        status: "PAID",
      },
    },

    {
      $group: {
        _id: null,

        revenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const revenue = revenueResult[0]?.revenue || 0;

  /* -------------------------------------------------------
     ACTIVE CLIENTS
  ------------------------------------------------------- */

  /*
   * Therapist ke saath CONFIRMED ya COMPLETED session
   * kar chuke unique clients.
   */

  const activeClientsResult = await Session.aggregate([
    {
      $match: {
        therapistId,

        status: {
          $in: ["CONFIRMED", "COMPLETED"],
        },
      },
    },

    {
      $group: {
        _id: "$clientId",
      },
    },

    {
      $count: "count",
    },
  ]);

  const activeClients = activeClientsResult[0]?.count || 0;

  return {
    revenue,
    activeClients,
  };
};

/* =========================================================
   REVENUE TREND
========================================================= */

/*
 * Therapist ka month-wise paid revenue.
 *
 * Revenue Payment ke paidAt ke basis par calculate hoga.
 *
 * Example:
 *
 * [
 *   {
 *     year: 2026,
 *     monthNumber: 8,
 *     month: "Aug",
 *     revenue: 48500
 *   }
 * ]
 */

const getRevenueTrend = async (therapistId) => {
  const revenueData = await Payment.aggregate([
    /* -----------------------------------------------------
       ONLY PAID PAYMENTS OF CURRENT THERAPIST
    ----------------------------------------------------- */

    {
      $match: {
        therapistId,
        status: "PAID",

        /*
         * paidAt null hone wale records ko aggregation
         * mein include nahi karna.
         */
        paidAt: {
          $ne: null,
        },
      },
    },

    /* -----------------------------------------------------
       GROUP BY YEAR + MONTH
    ----------------------------------------------------- */

    {
      $group: {
        _id: {
          year: {
            $year: "$paidAt",
          },

          month: {
            $month: "$paidAt",
          },
        },

        revenue: {
          $sum: "$amount",
        },
      },
    },

    /* -----------------------------------------------------
       CHRONOLOGICAL ORDER
    ----------------------------------------------------- */

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },

    /* -----------------------------------------------------
       RESPONSE FORMAT
    ----------------------------------------------------- */

    {
      $project: {
        _id: 0,

        year: "$_id.year",

        monthNumber: "$_id.month",

        month: {
          $arrayElemAt: [
            [
              "",
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            "$_id.month",
          ],
        },

        revenue: 1,
      },
    },
  ]);

  return revenueData;
};

/* =========================================================
   CLIENT ANALYTICS
========================================================= */

/*
 * Client metrics:
 *
 * 1. Total Clients
 * 2. Active Clients
 * 3. New Clients
 */

const getClientAnalytics = async (therapistId) => {
  /* -------------------------------------------------------
     GROUP CLIENTS BY THEIR FIRST SESSION
  ------------------------------------------------------- */

  const clientSessions = await Session.aggregate([
    {
      $match: {
        therapistId,

        status: {
          $in: ["CONFIRMED", "COMPLETED"],
        },
      },
    },

    {
      $group: {
        _id: "$clientId",

        /*
         * Therapist ke saath client ka
         * first valid session.
         */
        firstSession: {
          $min: "$date",
        },
      },
    },
  ]);

  /* -------------------------------------------------------
     TOTAL CLIENTS
  ------------------------------------------------------- */

  const totalClients = clientSessions.length;

  /* -------------------------------------------------------
     ACTIVE CLIENTS
  ------------------------------------------------------- */

  /*
   * Jo clients therapist ke saath at least ek
   * CONFIRMED / COMPLETED session rakhte hain.
   *
   * Har grouped client ka firstSession present hone
   * ki wajah se ye count totalClients ke equal hoga.
   */

  const activeClients = clientSessions.length;

  /* -------------------------------------------------------
     CURRENT MONTH
  ------------------------------------------------------- */

  const now = new Date();

  const currentYear = now.getFullYear();

  const currentMonth = now.getMonth();

  const monthStart = new Date(currentYear, currentMonth, 1);

  const monthEnd = new Date(currentYear, currentMonth + 1, 1);

  /* -------------------------------------------------------
     NEW CLIENTS
  ------------------------------------------------------- */

  /*
   * Jinka therapist ke saath first valid session
   * current month mein hua hai.
   */

  const newClients = clientSessions.filter((client) => {
    if (!client.firstSession) {
      return false;
    }

    const firstSession = new Date(client.firstSession);

    return firstSession >= monthStart && firstSession < monthEnd;
  }).length;

  return {
    totalClients,
    activeClients,
    newClients,
  };
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  getAnalyticsOverview,
  getRevenueTrend,
  getClientAnalytics,
};
