const Client = require("../models/client.model");

/* =========================================================
   Find Client Profile by User ID
========================================================= */

const findClientByUserId = async (userId) => {
  return await Client.findOne({ userId }).lean();
};

/* =========================================================
   Create Client Profile
========================================================= */

const createClient = async (clientData) => {
  return await Client.create(clientData);
};

/* =========================================================
   Update Client Profile by User ID
========================================================= */

const updateClientByUserId = async (userId, data) => {
  return await Client.findOneAndUpdate({ userId }, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* =========================================================
   Delete Client Profile by User ID
========================================================= */

const deleteClientByUserId = async (userId) => {
  return await Client.findOneAndDelete({ userId });
};

/* =========================================================
   Find Clients Associated with Therapist
========================================================= */

/**
 * Returns clients who have at least one session
 * with the given therapist.
 *
 * Also returns:
 * - client email from User collection
 * - all sessions booked with this therapist
 * - latest session
 * - total session count
 */

const findClientsByTherapistId = async (therapistId) => {
  return await Client.aggregate([
    /* -----------------------------------------------------
       Join Sessions with Client
    ----------------------------------------------------- */

    {
      $lookup: {
        from: "sessions",
        localField: "_id",
        foreignField: "clientId",
        as: "sessions",
      },
    },

    /* -----------------------------------------------------
       Keep only sessions belonging to this therapist
    ----------------------------------------------------- */

    {
      $set: {
        therapistSessions: {
          $filter: {
            input: "$sessions",
            as: "session",
            cond: {
              $eq: ["$$session.therapistId", therapistId],
            },
          },
        },
      },
    },

    /* -----------------------------------------------------
       Only clients who actually booked this therapist
    ----------------------------------------------------- */

    {
      $match: {
        $expr: {
          $gt: [{ $size: "$therapistSessions" }, 0],
        },
      },
    },

    /* -----------------------------------------------------
       Join User collection to get email
    ----------------------------------------------------- */

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },

    /* -----------------------------------------------------
       Project Client Data
    ----------------------------------------------------- */

    {
      $project: {
        _id: 1,
        userId: 1,
        name: 1,
        phone: 1,
        age: 1,
        gender: 1,
        occupation: 1,
        presentingConcern: 1,
        relevantHistory: 1,
        consent: 1,
        profileCompleted: 1,
        createdAt: 1,

        email: "$user.email",

        sessions: {
          $map: {
            input: "$therapistSessions",
            as: "session",
            in: {
              _id: "$$session._id",
              date: "$$session.date",
              startTime: "$$session.startTime",
              endTime: "$$session.endTime",
              duration: "$$session.duration",
              status: "$$session.status",
              paymentStatus: "$$session.paymentStatus",
            },
          },
        },

        sessionsCount: {
          $size: "$therapistSessions",
        },

        lastSession: {
          $arrayElemAt: ["$therapistSessions", -1],
        },
      },
    },

    /* -----------------------------------------------------
       Sort Clients
    ----------------------------------------------------- */

    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
};

/* =========================================================
   Exports
========================================================= */

module.exports = {
  findClientByUserId,
  createClient,
  updateClientByUserId,
  deleteClientByUserId,
  findClientsByTherapistId,
};
