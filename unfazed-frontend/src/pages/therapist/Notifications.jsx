import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../api/notificationApi";

function TherapistNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = async () => {
    try {
      setError("");

      const response = await getMyNotifications();

      // Supports current ApiResponse structure
      // as well as direct response data.
      const responseBody = response?.data ?? response;
      const notificationData = responseBody?.data ?? responseBody ?? {};

      setNotifications(notificationData?.notifications || []);
      setUnreadCount(notificationData?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      setError(
        error?.response?.data?.message || "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  /* =========================================================
     MARK SINGLE NOTIFICATION AS READ
  ========================================================= */

  const handleMarkAsRead = async (notification) => {
    try {
      if (notification.isRead) {
        return;
      }

      await markNotificationAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  const handleMarkAllAsRead = async () => {
    try {
      if (unreadCount === 0) {
        return;
      }

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================= */

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationToDelete = notifications.find(
        (item) => item._id === notificationId,
      );

      await deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter((item) => item._id !== notificationId),
      );

      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount((current) => Math.max(current - 1, 0));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Bell size={18} />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900">
                Notifications
              </h1>

              <p className="text-[10px] text-slate-400">
                Stay updated with your practice
              </p>
            </div>
          </div>

          {/* Mark all */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Check size={14} />
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-5xl p-5 sm:p-8">
        {/* Page heading */}
        <div className="mb-6">
          <p className="text-sm font-medium text-violet-600">
            Therapist Portal
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Your Notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Updates about your sessions, clients and practice.
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="w-fit shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading notifications...
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-3 text-xs font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!loading && !error && notifications.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <Bell size={24} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No notifications
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
              You're all caught up. New session bookings, reminders and updates
              will appear here.
            </p>
          </div>
        )}

        {/* =====================================================
            NOTIFICATIONS LIST
        ====================================================== */}

        {!loading && !error && notifications.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification._id}
                  className={`group flex gap-4 border-b border-slate-100 px-5 py-5 transition last:border-b-0 sm:px-6 ${
                    notification.isRead ? "bg-white" : "bg-violet-50/40"
                  }`}
                >
                  {/* Notification Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      notification.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-violet-100 text-violet-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notification)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start gap-2">
                      <h3
                        className={`truncate text-sm font-semibold ${
                          notification.isRead
                            ? "text-slate-700"
                            : "text-slate-900"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      {/* Unread Dot */}
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function getNotificationIcon(type) {
  switch (type) {
    case "SESSION_REMINDER":
      return Bell;

    case "SESSION_BOOKED":
      return CalendarDays;

    case "SESSION_COMPLETED":
      return CheckCircle2;

    case "SESSION_CANCELLED":
      return Clock3;

    case "NOTE_SHARED":
      return FileText;

    default:
      return Bell;
  }
}

/* =========================================================
   TIME FORMATTER
========================================================= */

function formatNotificationTime(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / (1000 * 60));

  const hours = Math.floor(difference / (1000 * 60 * 60));

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default TherapistNotifications;
