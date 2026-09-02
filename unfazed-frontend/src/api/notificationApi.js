import api from "./axios";

/* -------------------------------------------------------------------------- */
/*                         Get My Notifications                               */
/* -------------------------------------------------------------------------- */

/*
 * Optional:
 * isRead = true  -> only read notifications
 * isRead = false -> only unread notifications
 * undefined      -> all notifications
 */
export const getMyNotifications = async (isRead) => {
  const params =
    isRead === undefined
      ? {}
      : {
          isRead,
        };

  const response = await api.get("/notifications", {
    params,
  });

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                      Get Notification By ID                                */
/* -------------------------------------------------------------------------- */

export const getNotificationById = async (notificationId) => {
  const response = await api.get(`/notifications/${notificationId}`);

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                    Mark Notification As Read                               */
/* -------------------------------------------------------------------------- */

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                   Mark All Notifications As Read                           */
/* -------------------------------------------------------------------------- */

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                         Delete Notification                                */
/* -------------------------------------------------------------------------- */

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);

  return response.data;
};
