const notificationService = require("../services/notification.service");

const ApiResponse = require("../../../utils/apiResponse");
const asyncHandler = require("../../../utils/asyncHandler");

/* -------------------------------------------------------------------------- */
/*                         Get My Notifications                               */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/notifications
 *
 * Optional:
 * ?isRead=true
 * ?isRead=false
 */
const getMyNotificationsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const isRead = req.validatedQuery?.isRead;

  const result = await notificationService.getMyNotifications(userId, isRead);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Notifications fetched successfully."));
});

/* -------------------------------------------------------------------------- */
/*                     Get Single Notification                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/notifications/:id
 */
const getNotificationByIdController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { id } = req.validatedParams;

  const notification = await notificationService.getNotificationById(
    userId,
    id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, notification, "Notification fetched successfully."),
    );
});

/* -------------------------------------------------------------------------- */
/*                    Mark Notification As Read                               */
/* -------------------------------------------------------------------------- */

/**
 * PATCH /api/notifications/:id/read
 */
const markNotificationAsReadController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { id } = req.validatedParams;

  const notification = await notificationService.markNotificationAsRead(
    userId,
    id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read."));
});

/* -------------------------------------------------------------------------- */
/*                   Mark All Notifications As Read                           */
/* -------------------------------------------------------------------------- */

/**
 * PATCH /api/notifications/read-all
 */
const markAllNotificationsAsReadController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await notificationService.markAllNotificationsAsRead(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All notifications marked as read."));
});

/* -------------------------------------------------------------------------- */
/*                        Delete Notification                                  */
/* -------------------------------------------------------------------------- */

/**
 * DELETE /api/notifications/:id
 */
const deleteNotificationController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { id } = req.validatedParams;

  const result = await notificationService.deleteNotification(userId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Notification deleted successfully."));
});

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  getMyNotificationsController,
  getNotificationByIdController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
};
