const notificationRepository = require("../repositories/notification.repository");

const User = require("../../auth/models/user.model");

const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                         Create Notification                                */
/* -------------------------------------------------------------------------- */

/*
 * Internal function.
 *
 * Ye function frontend se directly call nahi hoga.
 * Notes, Session aur Reminder jaise modules is function ko
 * notification create karne ke liye use karenge.
 */
const createNotification = async (data) => {
  const {
    recipientId,
    type,
    title,
    message,
    sessionId = null,
    noteId = null,
  } = data;

  /* ------------------------------------------------------------------------ */
  /*                         Validate Recipient                              */
  /* ------------------------------------------------------------------------ */

  const recipient = await User.findById(recipientId).select("_id role");

  if (!recipient) {
    throw new ApiError(
      404,
      "Notification recipient not found.",
      "RECIPIENT_NOT_FOUND",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           Create Notification                            */
  /* ------------------------------------------------------------------------ */

  return await notificationRepository.createNotification({
    recipientId,
    type,
    title,
    message,
    sessionId,
    noteId,
  });
};

/* -------------------------------------------------------------------------- */
/*                        Get My Notifications                                */
/* -------------------------------------------------------------------------- */

/*
 * Logged-in user ki notifications fetch karta hai.
 *
 * isRead:
 * true  -> read notifications
 * false -> unread notifications
 * undefined -> all notifications
 */
const getMyNotifications = async (userId, isRead) => {
  const user = await User.findById(userId).select("_id role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  const notifications =
    await notificationRepository.findNotificationsByRecipientId(
      user._id,
      isRead,
    );

  const unreadCount = await notificationRepository.countUnreadNotifications(
    user._id,
  );

  return {
    notifications,
    unreadCount,
  };
};

/* -------------------------------------------------------------------------- */
/*                     Get Single Notification                                */
/* -------------------------------------------------------------------------- */

const getNotificationById = async (userId, notificationId) => {
  const user = await User.findById(userId).select("_id role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  const notification =
    await notificationRepository.findNotificationById(notificationId);

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found.",
      "NOTIFICATION_NOT_FOUND",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           Ownership Check                                */
  /* ------------------------------------------------------------------------ */

  if (notification.recipientId.toString() !== user._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to access this notification.",
      "NOTIFICATION_ACCESS_DENIED",
    );
  }

  return notification;
};

/* -------------------------------------------------------------------------- */
/*                    Mark Notification As Read                               */
/* -------------------------------------------------------------------------- */

const markNotificationAsRead = async (userId, notificationId) => {
  const user = await User.findById(userId).select("_id role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  const notification =
    await notificationRepository.findNotificationById(notificationId);

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found.",
      "NOTIFICATION_NOT_FOUND",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           Ownership Check                                */
  /* ------------------------------------------------------------------------ */

  if (notification.recipientId.toString() !== user._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to modify this notification.",
      "NOTIFICATION_ACCESS_DENIED",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           Already Read                                   */
  /* ------------------------------------------------------------------------ */

  if (notification.isRead) {
    return notification;
  }

  return await notificationRepository.markNotificationAsRead(notificationId);
};

/* -------------------------------------------------------------------------- */
/*                    Mark All Notifications As Read                          */
/* -------------------------------------------------------------------------- */

const markAllNotificationsAsRead = async (userId) => {
  const user = await User.findById(userId).select("_id role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  const result = await notificationRepository.markAllNotificationsAsRead(
    user._id,
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

/* -------------------------------------------------------------------------- */
/*                              Delete                                        */
/* -------------------------------------------------------------------------- */

/*
 * Optional future functionality.
 *
 * User apni notification delete kar sakta hai.
 */
const deleteNotification = async (userId, notificationId) => {
  const user = await User.findById(userId).select("_id role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  const notification =
    await notificationRepository.findNotificationById(notificationId);

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found.",
      "NOTIFICATION_NOT_FOUND",
    );
  }

  if (notification.recipientId.toString() !== user._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to delete this notification.",
      "NOTIFICATION_ACCESS_DENIED",
    );
  }

  await notificationRepository.deleteNotification(notificationId);

  return {
    id: notificationId,
  };
};

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
