import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  FileText,
  Clock3,
} from "lucide-react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";

function Notifications() {
  /* =========================================================
     STATE
  ========================================================== */

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [markingAllRead, setMarkingAllRead] = useState(false);

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================== */

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyNotifications();

      /*
       * Axios se response.data backend ka ApiResponse body hota hai.
       *
       * Expected:
       *
       * {
       *   success: true,
       *   data: {
       *     notifications: [],
       *     unreadCount: 2
       *   }
       * }
       *
       * Isliye pehle response.data lenge.
       */
      const responseBody = response?.data ?? response;

      /*
       * Agar response mein actual data nested hai:
       *
       * responseBody.data
       *
       * otherwise responseBody ko hi use karenge.
       */
      const notificationData =
        responseBody?.data ?? responseBody ?? {};

      setNotifications(
        notificationData?.notifications || [],
      );

      setUnreadCount(
        notificationData?.unreadCount || 0,
      );
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  /* =========================================================
     FORMAT TIME
  ========================================================== */

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return "";
    }

    const now = new Date();

    const differenceInSeconds = Math.floor(
      (now.getTime() - createdDate.getTime()) / 1000,
    );

    if (differenceInSeconds < 60) {
      return "Just now";
    }

    const differenceInMinutes = Math.floor(
      differenceInSeconds / 60,
    );

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    }

    const differenceInHours = Math.floor(
      differenceInMinutes / 60,
    );

    if (differenceInHours < 24) {
      return `${differenceInHours} hour${
        differenceInHours > 1 ? "s" : ""
      } ago`;
    }

    const differenceInDays = Math.floor(
      differenceInHours / 24,
    );

    if (differenceInDays < 7) {
      return `${differenceInDays} day${
        differenceInDays > 1 ? "s" : ""
      } ago`;
    }

    return createdDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     MARK SINGLE NOTIFICATION AS READ
  ========================================================== */

  const handleMarkAsRead = async (notification) => {
    /*
     * Already read hai toh API call ki zarurat nahi.
     */
    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(notification._id);

      /*
       * Local state update.
       */
      setNotifications((previousNotifications) =>
        previousNotifications.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      /*
       * Unread count immediately decrease.
       */
      setUnreadCount((previousCount) =>
        Math.max(previousCount - 1, 0),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    }
  };

  /* =========================================================
     MARK ALL AS READ
  ========================================================== */

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAllRead(true);

      await markAllNotificationsAsRead();

      /*
       * Local state update.
       */
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}

          <Link
            to="/client"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">
                Client Portal
              </p>
            </div>
          </Link>

          {/* Notification Count + Profile */}

          <div className="flex items-center gap-4">
            <div className="relative rounded-lg bg-violet-50 p-2 text-violet-600">
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[8px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Profile */}

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                Y
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">
                  Client
                </p>

                <p className="text-[10px] text-slate-400">
                  My Profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          {/* Back */}

          <Link
            to="/client"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={15} />
            Back to Client Portal
          </Link>

          {/* =================================================
              HEADING
          ================================================== */}

          <div className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Bell size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                    Notifications
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Stay updated with your sessions, payments
                    and other important updates.
                  </p>
                </div>
              </div>

              {/* Mark All Read */}

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllRead}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />

                  {markingAllRead
                    ? "Marking..."
                    : "Mark all as read"}
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              NOTIFICATION LIST
          ================================================== */}

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Header */}

            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    All Notifications
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount > 1 ? "s" : ""
                        }`
                      : "You’re all caught up."}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-500">
                  {notifications.length}
                </span>
              </div>
            </div>

            {/* List */}

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <Bell size={18} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Loading notifications...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Please wait.
                  </p>
                </div>
              ) : error ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <Bell size={18} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Unable to load notifications
                  </p>

                  <p className="mt-1 text-xs text-red-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchNotifications}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Bell size={22} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    You’ll see important session and account
                    updates here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    formatTime={formatNotificationTime}
                  />
                ))
              )}
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-5 text-center text-[11px] text-slate-400">
            You will receive notifications for important account
            and session updates.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationItem({
  notification,
  onMarkAsRead,
  formatTime,
}) {
  /* =======================================================
     ICON
  ======================================================== */

  const getIcon = () => {
    switch (notification.type) {
      case "SESSION_REMINDER":
        return <Bell size={18} />;

      case "SESSION_BOOKED":
        return <CalendarDays size={18} />;

      case "SESSION_COMPLETED":
        return <CheckCircle2 size={18} />;

      case "SESSION_CANCELLED":
        return <Clock3 size={18} />;

      case "NOTE_SHARED":
        return <FileText size={18} />;

      default:
        return <Bell size={18} />;
    }
  };

  /* =======================================================
     READ STATUS
  ======================================================== */

  const isUnread = !notification.isRead;

  return (
    <button
      type="button"
      onClick={() => onMarkAsRead(notification)}
      className={`flex w-full gap-4 px-5 py-5 text-left transition hover:bg-slate-50 ${
        isUnread
          ? "bg-violet-50/40"
          : "bg-white"
      }`}
    >
      {/* Icon */}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isUnread
            ? "bg-violet-100 text-violet-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {getIcon()}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm ${
                isUnread
                  ? "font-bold text-slate-900"
                  : "font-semibold text-slate-800"
              }`}
            >
              {notification.title}
            </h3>

            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-violet-600" />
            )}
          </div>

          <span className="text-[10px] text-slate-400">
            {formatTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {notification.message}
        </p>

        <div className="mt-3 flex items-center gap-2">
          {isUnread ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-violet-600">
              <CheckCircle2 size={12} />
              Unread
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-400">
              Read
            </span>
          )}

          <span className="text-[10px] text-slate-300">
            •
          </span>

          <span className="text-[10px] font-medium text-slate-400">
            {formatNotificationType(notification.type)}
          </span>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   NOTIFICATION TYPE LABEL
========================================================= */

function formatNotificationType(type) {
  switch (type) {
    case "SESSION_BOOKED":
      return "Session";

    case "SESSION_COMPLETED":
      return "Session";

    case "SESSION_CANCELLED":
      return "Session";

    case "SESSION_REMINDER":
      return "Reminder";

    case "NOTE_SHARED":
      return "Shared Note";

    default:
      return "Notification";
  }
}

export default Notifications;