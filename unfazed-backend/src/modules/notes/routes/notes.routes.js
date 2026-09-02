const express = require("express");

const {
  createNoteController,
  getSessionNotesController,
  getMySharedNotesController,
  updateNoteController,
  deleteNoteController,
} = require("../controllers/notes.controller");

const {
  validateCreateNote,
  validateUpdateNote,
  validateSessionId,
  validateNoteId,
} = require("../validations/notes.validation");

const authMiddleware = require("../../../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   Create Session Note
========================================================= */

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a session note
 *     description: |
 *       Creates a PRIVATE or SHARED note for a session.
 *       Only the therapist who owns the session can create the note.
 *       Therapist and client IDs are derived from the session on the server.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - type
 *               - content
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "68c1234567890abcdef12345"
 *               type:
 *                 type: string
 *                 enum:
 *                   - PRIVATE
 *                   - SHARED
 *                 example: SHARED
 *               content:
 *                 type: string
 *                 example: "Discussed stress management techniques and coping strategies."
 *     responses:
 *       201:
 *         description: Session note created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the therapist who owns the session can create a note
 *       404:
 *         description: Session or therapist profile not found
 */

router.post("/", authMiddleware, validateCreateNote, createNoteController);

/* =========================================================
   Get My Shared Notes
   ---------------------------------------------------------
   Client endpoint
========================================================= */

/**
 * @swagger
 * /api/notes/shared:
 *   get:
 *     summary: Get my shared notes
 *     description: |
 *       Returns only SHARED notes belonging to the logged-in client.
 *       PRIVATE therapist notes are never returned.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shared notes fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only clients can access shared notes
 *       404:
 *         description: Client profile not found
 */

router.get("/shared", authMiddleware, getMySharedNotesController);

/* =========================================================
   Get Notes For Session
   ---------------------------------------------------------
   Therapist endpoint
========================================================= */

/**
 * @swagger
 * /api/notes/session/{sessionId}:
 *   get:
 *     summary: Get notes for a session
 *     description: |
 *       Returns all notes belonging to the selected session.
 *       Only the therapist who owns the session can access these notes.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68c1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Session notes fetched successfully
 *       400:
 *         description: Invalid session ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Therapist is not authorized to access this session
 *       404:
 *         description: Session not found
 */

router.get(
  "/session/:sessionId",
  authMiddleware,
  validateSessionId,
  getSessionNotesController,
);

/* =========================================================
   Update Note
========================================================= */

/**
 * @swagger
 * /api/notes/{id}:
 *   patch:
 *     summary: Update a session note
 *     description: |
 *       Updates the note type and/or content.
 *       Only the therapist who created/owns the note can update it.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "68c9876543210abcdef12345"
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
 *                   - PRIVATE
 *                   - SHARED
 *                 example: SHARED
 *               content:
 *                 type: string
 *                 example: "Updated session summary and coping strategies."
 *     responses:
 *       200:
 *         description: Session note updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You are not allowed to modify this note
 *       404:
 *         description: Note not found
 */

router.patch(
  "/:id",
  authMiddleware,
  validateNoteId,
  validateUpdateNote,
  updateNoteController,
);

/* =========================================================
   Delete Note
========================================================= */

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a session note
 *     description: Only the therapist who owns the note can delete it.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "68c9876543210abcdef12345"
 *     responses:
 *       200:
 *         description: Session note deleted successfully
 *       400:
 *         description: Invalid note ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You are not allowed to delete this note
 *       404:
 *         description: Note not found
 */

router.delete("/:id", authMiddleware, validateNoteId, deleteNoteController);

module.exports = router;
