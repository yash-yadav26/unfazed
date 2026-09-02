const express = require("express");

const {
  createClientController,
  getMyClientController,
  updateMyClientController,
  deleteMyClientController,
  getMyClientsController,
} = require("../controllers/client.controller");

const {
  validateCreateClient,
  validateUpdateClient,
} = require("../validations/client.validation");

const authMiddleware = require("../../../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   Create Client Profile
========================================================= */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create client profile
 *     tags:
 *       - Client
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
 *               - phone
 *               - age
 *               - gender
 *               - occupation
 *               - presentingConcern
 *               - relevantHistory
 *               - consent
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yash Yadav
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               age:
 *                 type: integer
 *                 example: 24
 *               gender:
 *                 type: string
 *                 enum:
 *                   - MALE
 *                   - FEMALE
 *                   - OTHER
 *                 example: MALE
 *               occupation:
 *                 type: string
 *                 example: Software Developer
 *               presentingConcern:
 *                 type: string
 *                 example: I am looking for help with stress and anxiety.
 *               relevantHistory:
 *                 type: string
 *                 example: I have experienced work related stress for the last few months.
 *               consent:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Client profile created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only clients can create a client profile
 *       409:
 *         description: Client profile already exists
 */

router.post("/", authMiddleware, validateCreateClient, createClientController);

/* =========================================================
   Get My Client Profile
========================================================= */

/**
 * @swagger
 * /api/clients/me:
 *   get:
 *     summary: Get logged-in client profile
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Client profile not found
 */

router.get("/me", authMiddleware, getMyClientController);

/* =========================================================
   Get My Clients
========================================================= */

/**
 * @swagger
 * /api/clients/my-clients:
 *   get:
 *     summary: Get clients who have booked the logged-in therapist
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clients fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only therapists can access their clients
 *       404:
 *         description: Therapist profile not found
 */

router.get("/my-clients", authMiddleware, getMyClientsController);

/* =========================================================
   Update My Client Profile
========================================================= */

/**
 * @swagger
 * /api/clients/me:
 *   patch:
 *     summary: Update logged-in client profile
 *     tags:
 *       - Client
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
 *                 example: Yash Yadav
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               age:
 *                 type: integer
 *                 example: 24
 *               gender:
 *                 type: string
 *                 enum:
 *                   - MALE
 *                   - FEMALE
 *                   - OTHER
 *                 example: MALE
 *               occupation:
 *                 type: string
 *                 example: Software Developer
 *               presentingConcern:
 *                 type: string
 *                 example: Updated concern information.
 *               relevantHistory:
 *                 type: string
 *                 example: Updated relevant history.
 *               consent:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Client profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Client profile not found
 */

router.patch(
  "/me",
  authMiddleware,
  validateUpdateClient,
  updateMyClientController,
);

/* =========================================================
   Delete My Client Profile
========================================================= */

/**
 * @swagger
 * /api/clients/me:
 *   delete:
 *     summary: Delete logged-in client profile
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Client profile not found
 */

router.delete("/me", authMiddleware, deleteMyClientController);

/* =========================================================
   Export Router
========================================================= */

module.exports = router;
