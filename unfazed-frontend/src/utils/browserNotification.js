/* -------------------------------------------------------------------------- */
/*                      Request Notification Permission                       */
/* -------------------------------------------------------------------------- */

/**
 * Request browser notification permission from the user.
 *
 * Returns:
 * - "granted"
 * - "denied"
 * - "default"
 * - "unsupported"
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error("Failed to request notification permission:", error);

    return "denied";
  }
};

/* -------------------------------------------------------------------------- */
/*                         Show Browser Notification                          */
/* -------------------------------------------------------------------------- */

/**
 * Show a native browser notification.
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.body
 */
export const showBrowserNotification = ({
  title = "Unfazed",
  body = "You have a new notification.",
}) => {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });

    return true;
  } catch (error) {
    console.error("Failed to show browser notification:", error);

    return false;
  }
};
