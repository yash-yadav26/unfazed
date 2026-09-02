const express = require("express");

const {
  getMyNotificationsController,
  getNotificationByIdController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
} = require("../controllers/notification.controller");

const {
  validateGetNotifications,
  validateNotificationId,
} = require("../validations/notification.validation");

const authMiddleware = require("../../../middleware/authMiddleware");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                            Get Notifications                              */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get my notifications
 *     description: Returns notifications belonging to the currently logged-in user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter notifications by read status.
 *     responses:
 *       200:
 *         description: Notifications fetched successfully.
 *       401:
 *         description: Authentication required.
 */
router.get(
  "/",
  authMiddleware,
  validateGetNotifications,
  getMyNotificationsController,
);

/* -------------------------------------------------------------------------- */
/*                         Get Single Notification                            */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     description: Returns a single notification belonging to the logged-in user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Notification fetched successfully.
 *       400:
 *         description: Invalid notification ID.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Notification not found.
 */
router.get(
  "/:id",
  authMiddleware,
  validateNotificationId,
  getNotificationByIdController,
);

/* -------------------------------------------------------------------------- */
/*                    Mark All Notifications As Read                          */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications of the logged-in user as read.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 *       401:
 *         description: Authentication required.
 */
router.patch("/read-all", authMiddleware, markAllNotificationsAsReadController);

/* -------------------------------------------------------------------------- */
/*                     Mark Notification As Read                              */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Marks a single notification as read.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *       400:
 *         description: Invalid notification ID.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Notification not found.
 */
router.patch(
  "/:id/read",
  authMiddleware,
  validateNotificationId,
  markNotificationAsReadController,
);

/* -------------------------------------------------------------------------- */
/*                          Delete Notification                               */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Deletes a notification belonging to the logged-in user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Notification deleted successfully.
 *       400:
 *         description: Invalid notification ID.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Notification not found.
 */
router.delete(
  "/:id",
  authMiddleware,
  validateNotificationId,
  deleteNotificationController,
);

module.exports = router;
