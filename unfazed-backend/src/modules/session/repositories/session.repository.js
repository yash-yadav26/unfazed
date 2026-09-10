const Session = require("../models/session.model");

/* -------------------------------------------------------------------------- */
/*                    Find Booked Sessions for Date                           */
/* -------------------------------------------------------------------------- */

const findBookedSessionsByTherapistAndDate = async (therapistId, date) => {
  return await Session.find({
    therapistId,
    date,
    status: {
      $in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
    },
  })
    .select("_id clientId therapistId date startTime endTime duration status")
    .sort({
      startTime: 1,
    })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                           Find Session by ID                                */
/* -------------------------------------------------------------------------- */

const findSessionById = async (sessionId) => {
  return await Session.findById(sessionId)
    .populate({
      path: "therapistId",
      select: "_id name slug specializations languages",
    })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                       Check Slot Availability                              */
/* -------------------------------------------------------------------------- */

const findActiveSessionByTherapistDateAndTime = async (
  therapistId,
  date,
  startTime,
) => {
  return await Session.findOne({
    therapistId,
    date,
    startTime,
    status: {
      $in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
    },
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                            Create Session                                   */
/* -------------------------------------------------------------------------- */

const createSession = async (sessionData) => {
  return await Session.create(sessionData);
};

/* -------------------------------------------------------------------------- */
/*                          Find Client Sessions                               */
/* -------------------------------------------------------------------------- */

const findSessionsByClientId = async (clientId) => {
  return await Session.find({
    clientId,
  })
    .populate({
      path: "therapistId",
      select: "_id name slug specializations languages",
    })
    .sort({
      date: 1,
      startTime: 1,
    })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                         Find Therapist Sessions                             */
/* -------------------------------------------------------------------------- */

const findSessionsByTherapistId = async (therapistId) => {
  return await Session.find({
    therapistId,
  })
    .populate({
      path: "clientId",
      select: "_id name email",
    })
    .sort({
      date: 1,
      startTime: 1,
    })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                            Update Session                                   */
/* -------------------------------------------------------------------------- */

const updateSession = async (sessionId, updateData) => {
  return await Session.findByIdAndUpdate(sessionId, updateData, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                           Cancel Session                                    */
/* -------------------------------------------------------------------------- */

const cancelSession = async (sessionId, cancelledBy) => {
  return await Session.findByIdAndUpdate(
    sessionId,
    {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledBy,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();
};

/* -------------------------------------------------------------------------- */
/*                       Update Payment Status                                 */
/* -------------------------------------------------------------------------- */

const updatePaymentStatus = async (sessionId, paymentData) => {
  return await Session.findByIdAndUpdate(sessionId, paymentData, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                      Find Session by Payment ID                            */
/* -------------------------------------------------------------------------- */

const findSessionByPaymentId = async (paymentId) => {
  return await Session.findOne({
    paymentId,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                      Update Session Join Status                            */
/* -------------------------------------------------------------------------- */

/**
 * Update client/therapist join information.
 *
 * updateData can contain:
 * - clientJoined
 * - clientJoinedAt
 * - therapistJoined
 * - therapistJoinedAt
 * - status
 */
const updateSessionJoinStatus = async (sessionId, updateData) => {
  return await Session.findByIdAndUpdate(sessionId, updateData, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                           Mark Session No-Show                              */
/* -------------------------------------------------------------------------- */

/**
 * Used when the session end time has passed
 * and one or both participants did not join.
 */
const markSessionAsNoShow = async (sessionId) => {
  return await Session.findByIdAndUpdate(
    sessionId,
    {
      status: "NO_SHOW",
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();
};

/* -------------------------------------------------------------------------- */
/*                           Complete Session                                  */
/* -------------------------------------------------------------------------- */

/**
 * Used when the actual session has been completed.
 */
const markSessionAsCompleted = async (sessionId) => {
  return await Session.findByIdAndUpdate(
    sessionId,
    {
      status: "COMPLETED",
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();
};

/* -------------------------------------------------------------------------- */
/*                    Find Chat-Eligible Session Between Users                */
/* -------------------------------------------------------------------------- */

/**
 * Find whether a client and therapist have a valid session together.
 *
 * Used to authorize chat access.
 */
const findSessionBetweenClientAndTherapist = async (clientId, therapistId) => {
  return await Session.findOne({
    clientId,
    therapistId,
    status: {
      $in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW"],
    },
  })
    .select("_id clientId therapistId status")
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                               Export                                        */
/* -------------------------------------------------------------------------- */

module.exports = {
  findBookedSessionsByTherapistAndDate,
  findSessionById,
  findActiveSessionByTherapistDateAndTime,
  createSession,
  findSessionsByClientId,
  findSessionsByTherapistId,
  updateSession,
  cancelSession,
  updatePaymentStatus,
  findSessionByPaymentId,
  updateSessionJoinStatus,
  markSessionAsNoShow,
  markSessionAsCompleted,
  findSessionBetweenClientAndTherapist,
};
