const express = require("express");

const authMiddleware = require("../../../middleware/authMiddleware");

const {
  validateChatUser,
  validateMarkMessagesAsRead,
} = require("../validations/chat.validation");

const {
  getChatMessagesController,
  markMessagesAsReadController,
  getUnreadMessagesCountController,
} = require("../controllers/chat.controller");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                              Swagger Tags                                  */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Therapist-client real-time chat APIs
 */

/* -------------------------------------------------------------------------- */
/*                       Get Unread Messages Count                            */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /chat/unread:
 *   get:
 *     summary: Get unread message counts
 *     description: |
 *       Returns conversation-wise unread message counts for the
 *       authenticated client or therapist.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message counts fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/unread", authMiddleware, getUnreadMessagesCountController);

/* -------------------------------------------------------------------------- */
/*                           Get Chat Messages                                */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /chat/{userId}/messages:
 *   get:
 *     summary: Get chat history
 *     description: |
 *       Returns the complete chat history between the authenticated user
 *       and the specified therapist/client.
 *
 *       Chat access is allowed only when the authenticated user
 *       has a valid booking/session with the other user.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the therapist/client to chat with
 *     responses:
 *       200:
 *         description: Chat messages fetched successfully
 *       400:
 *         description: Invalid user ID
 *       403:
 *         description: Chat access denied
 *       404:
 *         description: User or profile not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:userId/messages",
  authMiddleware,
  validateChatUser,
  getChatMessagesController,
);

/* -------------------------------------------------------------------------- */
/*                       Mark Messages As Read                                */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /chat/{userId}/read:
 *   patch:
 *     summary: Mark chat messages as read
 *     description: |
 *       Marks all unread messages received from the specified therapist/client
 *       as read for the authenticated user.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the therapist/client
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *       400:
 *         description: Invalid user ID
 *       403:
 *         description: Chat access denied
 *       404:
 *         description: User or profile not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:userId/read",
  authMiddleware,
  validateMarkMessagesAsRead,
  markMessagesAsReadController,
);

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = router;
