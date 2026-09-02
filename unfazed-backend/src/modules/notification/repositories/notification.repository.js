const Notification = require("../models/notification.model");

/* -------------------------------------------------------------------------- */
/*                         Create Notification                                */
/* -------------------------------------------------------------------------- */

const createNotification = async (notificationData) => {
  return await Notification.create(notificationData);
};

/* -------------------------------------------------------------------------- */
/*                         Find Notification By ID                            */
/* -------------------------------------------------------------------------- */

const findNotificationById = async (notificationId) => {
  return await Notification.findById(notificationId);
};

/* -------------------------------------------------------------------------- */
/*                         Get User Notifications                             */
/* -------------------------------------------------------------------------- */

/*
 * Returns notifications for a specific user.
 *
 * Optional isRead filter:
 * true  -> only read notifications
 * false -> only unread notifications
 * undefined -> all notifications
 */
const findNotificationsByRecipientId = async (recipientId, isRead) => {
  const filter = {
    recipientId,
  };

  if (isRead !== undefined) {
    filter.isRead = isRead;
  }

  return await Notification.find(filter)
    .populate({
      path: "sessionId",
      select:
        "_id therapistId clientId date startTime endTime duration status paymentStatus",
    })
    .populate({
      path: "noteId",
      select: "_id sessionId therapistId clientId type content createdAt",
    })
    .sort({ createdAt: -1 })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                          Get Unread Count                                  */
/* -------------------------------------------------------------------------- */

const countUnreadNotifications = async (recipientId) => {
  return await Notification.countDocuments({
    recipientId,
    isRead: false,
  });
};

/* -------------------------------------------------------------------------- */
/*                         Mark Notification Read                             */
/* -------------------------------------------------------------------------- */

const markNotificationAsRead = async (notificationId) => {
  return await Notification.findOneAndUpdate(
    {
      _id: notificationId,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    },
  ).lean();
};

/* -------------------------------------------------------------------------- */
/*                       Mark All Notifications Read                          */
/* -------------------------------------------------------------------------- */

const markAllNotificationsAsRead = async (recipientId) => {
  return await Notification.updateMany(
    {
      recipientId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );
};

/* -------------------------------------------------------------------------- */
/*                               Delete                                      */
/* -------------------------------------------------------------------------- */

const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  createNotification,
  findNotificationById,
  findNotificationsByRecipientId,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
