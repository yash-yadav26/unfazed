const express = require("express");

const {
  createTherapistController,
  getMyTherapistController,
  getAllTherapistsController,
  updateMyTherapistController,
  deleteMyTherapistController,
} = require("../controllers/therapist.controller");

const {
  validateCreateTherapist,
  validateUpdateTherapist,
} = require("../validations/therapist.validation");

const authMiddleware = require("../../../middleware/authMiddleware");

const router = express.Router();

// ===============================
// Create Therapist Profile
// ===============================

/**
 * @swagger
 * /api/therapists:
 *   post:
 *     summary: Create therapist profile
 *     tags:
 *       - Therapist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - bio
 *               - specializations
 *               - languages
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yash Yadav
 *               slug:
 *                 type: string
 *                 example: yash-yadav
 *               bio:
 *                 type: string
 *                 example: I provide supportive therapy for anxiety, stress and relationship concerns.
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Anxiety & Stress
 *                   - Relationships
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - English
 *                   - Hindi
 *     responses:
 *       201:
 *         description: Therapist profile created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only therapists can create a profile
 *       409:
 *         description: Therapist profile already exists
 */

router.post(
  "/",
  authMiddleware,
  validateCreateTherapist,
  createTherapistController,
);

// ===============================
// Get My Therapist Profile
// ===============================

/**
 * @swagger
 * /api/therapists/me:
 *   get:
 *     summary: Get logged-in therapist profile
 *     tags:
 *       - Therapist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Therapist profile fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Therapist profile not found
 */

router.get("/me", authMiddleware, getMyTherapistController);

// ===============================
// Get All Therapists
// ===============================

/**
 * @swagger
 * /api/therapists:
 *   get:
 *     summary: Get all therapists
 *     tags:
 *       - Therapist
 *     responses:
 *       200:
 *         description: Therapists fetched successfully
 */

router.get("/", getAllTherapistsController);

// ===============================
// Update My Therapist Profile
// ===============================

/**
 * @swagger
 * /api/therapists/me:
 *   patch:
 *     summary: Update logged-in therapist profile
 *     tags:
 *       - Therapist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Yash Yadav
 *               slug:
 *                 type: string
 *                 example: dr-yash-yadav
 *               bio:
 *                 type: string
 *                 example: Updated therapist profile information.
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Anxiety & Stress
 *                   - Relationships
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - English
 *                   - Hindi
 *     responses:
 *       200:
 *         description: Therapist profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Therapist profile not found
 */

router.patch(
  "/me",
  authMiddleware,
  validateUpdateTherapist,
  updateMyTherapistController,
);

// ===============================
// Delete My Therapist Profile
// ===============================

/**
 * @swagger
 * /api/therapists/me:
 *   delete:
 *     summary: Delete logged-in therapist profile
 *     tags:
 *       - Therapist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Therapist profile deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Therapist profile not found
 */

router.delete("/me", authMiddleware, deleteMyTherapistController);

module.exports = router;
