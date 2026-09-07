const express = require("express");

const {
  getAvailableSlotsController,
  createSessionController,
  joinSessionController,
  getMySessionsController,
  cancelSessionController,
  getSessionByIdController,
} = require("../controllers/session.controller");

const authMiddleware = require("../../../middleware/authMiddleware");

const {
  validateGetAvailableSlots,
  validateCreateSession,
  validateSessionId,
  validateCancelSession,
} = require("../validations/session.validation");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                  Swagger                                   */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * tags:
 *   name: Session
 *   description: Session booking, joining and appointment management APIs
 */

/* -------------------------------------------------------------------------- */
/*                         Get Available Slots                                */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/session/slots:
 *   get:
 *     summary: Get available session slots
 *     description: >
 *       Returns available time slots for a therapist on a selected date.
 *       Weekly availability, one-time overrides, blocked dates and already
 *       booked sessions are considered.
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Therapist MongoDB ObjectId.
 *         example: "68b123456789abcdef123456"
 *
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Session date in YYYY-MM-DD format.
 *         example: "2026-09-10"
 *
 *     responses:
 *       200:
 *         description: Available slots fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Available session slots fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2026-09-10"
 *                     dayOfWeek:
 *                       type: string
 *                       example: THURSDAY
 *                     sessionDuration:
 *                       type: integer
 *                       nullable: true
 *                       minimum: 1
 *                       maximum: 240
 *                       example: 60
 *                     bufferTime:
 *                       type: integer
 *                       nullable: true
 *                       minimum: 0
 *                       maximum: 120
 *                       example: 15
 *                     price:
 *                       type: number
 *                       nullable: true
 *                       minimum: 0
 *                       example: 1200
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: string
 *                         pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *                       example:
 *                         - "10:00"
 *                         - "11:15"
 *                         - "12:30"
 *
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Therapist not found.
 */
router.get(
  "/slots",
  authMiddleware,
  validateGetAvailableSlots,
  getAvailableSlotsController,
);

/* -------------------------------------------------------------------------- */
/*                            Create Session                                  */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/session:
 *   post:
 *     summary: Create a session booking
 *     description: >
 *       Books an available session slot for the logged-in client.
 *       Session duration and price are determined from the therapist's
 *       effective availability.
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - therapistId
 *               - date
 *               - startTime
 *             properties:
 *               therapistId:
 *                 type: string
 *                 description: Therapist MongoDB ObjectId.
 *                 example: "68b123456789abcdef123456"
 *
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Session date in YYYY-MM-DD format.
 *                 example: "2026-09-10"
 *
 *               startTime:
 *                 type: string
 *                 description: Session start time in HH:mm format.
 *                 example: "10:00"
 *
 *     responses:
 *       201:
 *         description: Session booked successfully.
 *
 *       400:
 *         description: Invalid session data.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       404:
 *         description: Therapist or client profile not found.
 *
 *       409:
 *         description: Selected slot is no longer available.
 */
router.post(
  "/",
  authMiddleware,
  validateCreateSession,
  createSessionController,
);

/* -------------------------------------------------------------------------- */
/*                              Join Session                                  */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/session/{id}/join:
 *   post:
 *     summary: Join a therapy session
 *     description: >
 *       Allows the authenticated client or therapist to join a confirmed
 *       therapy session. The server identifies the participant using the
 *       authenticated user's profile. No role is accepted from the request
 *       body.
 *
 *       When the first participant joins, the session becomes IN_PROGRESS.
 *       When the second participant joins, the session becomes COMPLETED
 *       according to the current application lifecycle.
 *
 *       The request must be made during the scheduled session window.
 *
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session MongoDB ObjectId.
 *         example: "68b123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Session joined successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Session joined successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       description: Updated session object.
 *                     participant:
 *                       type: string
 *                       enum:
 *                         - CLIENT
 *                         - THERAPIST
 *                       example: CLIENT
 *                     alreadyJoined:
 *                       type: boolean
 *                       example: false
 *
 *       400:
 *         description: >
 *           Session is not confirmed, has not started, has already ended,
 *           has been cancelled, completed, or marked as no-show.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: You are not allowed to join this session.
 *
 *       404:
 *         description: Session not found.
 *
 *       500:
 *         description: Invalid session date/time configuration.
 */
router.post(
  "/:id/join",
  authMiddleware,
  validateSessionId,
  joinSessionController,
);

/* -------------------------------------------------------------------------- */
/*                           Get My Sessions                                  */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/session/my-sessions:
 *   get:
 *     summary: Get logged-in client's sessions
 *     description: >
 *       Returns upcoming, completed, cancelled and no-show sessions
 *       belonging to the logged-in client.
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Sessions fetched successfully.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       404:
 *         description: Client profile not found.
 */
router.get("/my-sessions", authMiddleware, getMySessionsController);

/* -------------------------------------------------------------------------- */
/*                           Get Session By ID                                */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/session/{id}:
 *   get:
 *     summary: Get session by ID
 *     description: >
 *       Returns a single session belonging to the logged-in client.
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session MongoDB ObjectId.
 *         example: "68b123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Session fetched successfully.
 *
 *       400:
 *         description: Invalid session ID.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Access denied.
 *
 *       404:
 *         description: Session not found.
 */
router.get("/:id", authMiddleware, validateSessionId, getSessionByIdController);

/* -------------------------------------------------------------------------- */
/*                            Cancel Session                                  */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/session/{id}/cancel:
 *   patch:
 *     summary: Cancel a session
 *     description: >
 *       Cancels a session booked by the logged-in client.
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session MongoDB ObjectId.
 *         example: "68b123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Session cancelled successfully.
 *
 *       400:
 *         description: Session cannot be cancelled.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Access denied.
 *
 *       404:
 *         description: Session not found.
 *
 *       409:
 *         description: Session is already cancelled.
 */
router.patch(
  "/:id/cancel",
  authMiddleware,
  validateCancelSession,
  cancelSessionController,
);

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = router;
