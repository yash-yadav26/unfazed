const express = require("express");

const {
  createAvailabilityController,
  getMyAvailabilityController,
  updateAvailabilityController,
  deleteAvailabilityController,
} = require("../controllers/availability.controller");

const {
  validateCreateAvailability,
  validateUpdateAvailability,
  validateAvailabilityId,
} = require("../validations/availability.validation");

const authMiddleware = require("../../../middleware/authMiddleware");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                         Create Availability                                */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/scheduling/availability:
 *   post:
 *     summary: Create therapist availability
 *     description: >
 *       Creates a weekly recurring availability, a one-time override,
 *       or a blocked date for the logged-in therapist.
 *     tags:
 *       - Scheduling - Availability
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
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum:
 *                   - WEEKLY
 *                   - OVERRIDE
 *                   - BLOCKED
 *                 example: WEEKLY
 *                 description: Availability type.
 *
 *               dayOfWeek:
 *                 type: string
 *                 enum:
 *                   - MONDAY
 *                   - TUESDAY
 *                   - WEDNESDAY
 *                   - THURSDAY
 *                   - FRIDAY
 *                   - SATURDAY
 *                   - SUNDAY
 *                 example: WEDNESDAY
 *                 description: Required for WEEKLY availability.
 *
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-15"
 *                 description: Required for OVERRIDE and BLOCKED availability.
 *
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *                 description: Time in HH:mm format.
 *
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *                 description: Time in HH:mm format.
 *
 *               sessionDuration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 240
 *                 example: 60
 *                 description: >
 *                   Session duration in minutes. Therapist can choose any
 *                   whole number between 1 and 240.
 *
 *               bufferTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 120
 *                 example: 15
 *                 description: >
 *                   Break between two sessions in minutes. Therapist can choose
 *                   any whole number between 0 and 120.
 *
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 700
 *                 description: Price for one session of the selected duration.
 *
 *           examples:
 *             weekly:
 *               summary: Weekly availability
 *               value:
 *                 type: WEEKLY
 *                 dayOfWeek: WEDNESDAY
 *                 isAvailable: true
 *                 startTime: "10:00"
 *                 endTime: "16:00"
 *                 sessionDuration: 60
 *                 bufferTime: 15
 *                 price: 700
 *
 *             override:
 *               summary: One-time override
 *               value:
 *                 type: OVERRIDE
 *                 date: "2026-09-15"
 *                 isAvailable: true
 *                 startTime: "14:00"
 *                 endTime: "18:00"
 *                 sessionDuration: 45
 *                 bufferTime: 10
 *                 price: 900
 *
 *             blocked:
 *               summary: Block a date
 *               value:
 *                 type: BLOCKED
 *                 date: "2026-09-20"
 *                 isAvailable: false
 *
 *     responses:
 *       201:
 *         description: Availability created successfully.
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Only therapists can manage availability.
 *       404:
 *         description: Therapist profile not found.
 *       409:
 *         description: Availability already exists.
 */
router.post(
  "/availability",
  authMiddleware,
  validateCreateAvailability,
  createAvailabilityController,
);

/* -------------------------------------------------------------------------- */
/*                          Get My Availability                               */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/scheduling/availability:
 *   get:
 *     summary: Get my availability
 *     description: Returns all availability records of the logged-in therapist.
 *     tags:
 *       - Scheduling - Availability
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability fetched successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Only therapists can access availability.
 *       404:
 *         description: Therapist profile not found.
 */
router.get("/availability", authMiddleware, getMyAvailabilityController);

/* -------------------------------------------------------------------------- */
/*                          Update Availability                               */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/scheduling/availability/{id}:
 *   patch:
 *     summary: Update therapist availability
 *     description: >
 *       Updates an existing availability record owned by the logged-in therapist.
 *     tags:
 *       - Scheduling - Availability
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *         description: Availability MongoDB ObjectId.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum:
 *                   - WEEKLY
 *                   - OVERRIDE
 *                   - BLOCKED
 *
 *               dayOfWeek:
 *                 type: string
 *                 enum:
 *                   - MONDAY
 *                   - TUESDAY
 *                   - WEDNESDAY
 *                   - THURSDAY
 *                   - FRIDAY
 *                   - SATURDAY
 *                   - SUNDAY
 *
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-15"
 *
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *
 *               startTime:
 *                 type: string
 *                 example: "11:00"
 *
 *               endTime:
 *                 type: string
 *                 example: "19:00"
 *
 *               sessionDuration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 240
 *                 example: 60
 *                 description: >
 *                   Session duration in minutes. Any whole number from 1 to 240.
 *
 *               bufferTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 120
 *                 example: 15
 *                 description: >
 *                   Buffer time between sessions in minutes. Any whole number
 *                   from 0 to 120.
 *
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 900
 *                 description: Price for one session of the selected duration.
 *
 *     responses:
 *       200:
 *         description: Availability updated successfully.
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: You are not allowed to modify this availability.
 *       404:
 *         description: Availability not found.
 *       409:
 *         description: Duplicate availability.
 */
router.patch(
  "/availability/:id",
  authMiddleware,
  validateAvailabilityId,
  validateUpdateAvailability,
  updateAvailabilityController,
);

/* -------------------------------------------------------------------------- */
/*                          Delete Availability                               */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/scheduling/availability/{id}:
 *   delete:
 *     summary: Delete therapist availability
 *     description: >
 *       Deletes an availability record owned by the logged-in therapist.
 *     tags:
 *       - Scheduling - Availability
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *         description: Availability MongoDB ObjectId.
 *
 *     responses:
 *       200:
 *         description: Availability deleted successfully.
 *       400:
 *         description: Invalid availability ID.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: You are not allowed to delete this availability.
 *       404:
 *         description: Availability not found.
 */
router.delete(
  "/availability/:id",
  authMiddleware,
  validateAvailabilityId,
  deleteAvailabilityController,
);

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = router;
