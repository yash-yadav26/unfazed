const sessionService = require("../services/session.service");

/* -------------------------------------------------------------------------- */
/*                         Get Available Slots                                */
/* -------------------------------------------------------------------------- */

/**
 * Get available slots for a therapist on a specific date.
 *
 * GET /api/session/slots?therapistId=...&date=YYYY-MM-DD
 */
const getAvailableSlotsController = async (req, res, next) => {
  try {
    const { therapistId, date } = req.validatedQuery;

    const data = await sessionService.getAvailableSlots(therapistId, date);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Available session slots fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                           Create Session                                   */
/* -------------------------------------------------------------------------- */

/**
 * Create a session booking.
 *
 * POST /api/session
 */
const createSessionController = async (req, res, next) => {
  try {
    const { therapistId, date, startTime } = req.validatedBody;

    const session = await sessionService.createSession({
      userId: req.user.id,
      therapistId,
      date,
      startTime,
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Session booked successfully.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                            Join Session                                    */
/* -------------------------------------------------------------------------- */

/**
 * Join a scheduled therapy session.
 *
 * Client and therapist use the same API.
 *
 * POST /api/session/:id/join
 *
 * The backend identifies whether the logged-in user is the
 * client or therapist. Role is NOT accepted from request body.
 */
const joinSessionController = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;

    const result = await sessionService.joinSession({
      userId: req.user.id,
      sessionId: id,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.alreadyJoined
        ? "You have already joined this session."
        : "Session joined successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                           Get My Sessions                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get logged-in client's sessions.
 *
 * GET /api/session/my-sessions
 */
const getMySessionsController = async (req, res, next) => {
  try {
    const data = await sessionService.getMySessions(req.user.id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sessions fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                           Cancel Session                                   */
/* -------------------------------------------------------------------------- */

/**
 * Cancel a session.
 *
 * PATCH /api/session/:id/cancel
 */
const cancelSessionController = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;

    const session = await sessionService.cancelSession({
      userId: req.user.id,
      sessionId: id,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Session cancelled successfully.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                           Get Session By ID                                */
/* -------------------------------------------------------------------------- */

/**
 * Get a single session by ID.
 *
 * GET /api/session/:id
 */
const getSessionByIdController = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;

    const session = await sessionService.getSessionById({
      userId: req.user.id,
      sessionId: id,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Session fetched successfully.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  getAvailableSlotsController,
  createSessionController,
  joinSessionController,
  getMySessionsController,
  cancelSessionController,
  getSessionByIdController,
};
