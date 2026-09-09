import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MessageCircle,
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
  ========================================================== */

  const fetchNotifications = async () => {
    try {
      setError("");

      const response = await getMyNotifications();

      // Supports current ApiResponse structure
      // as well as direct response data.
      const responseBody = response?.data ?? response;
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
          "Unable to load notifications.",
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
     MARK SINGLE NOTIFICATION AS READ
  ========================================================== */

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

      setUnreadCount((current) =>
        Math.max(current - 1, 0),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to mark the notification as read. Please try again.",
        { id: "therapist-notification-read-error" },
      );
    }
  };

  /* =========================================================
     MARK ALL AS READ
  ========================================================== */

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

      toast.success("All notifications marked as read.", {
        id: "therapist-mark-all-success",
      });
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to mark all notifications as read. Please try again.",
        { id: "therapist-mark-all-error" },
      );
    }
  };

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================== */

  const handleDeleteNotification = async (
    notificationId,
  ) => {
    try {
      const notificationToDelete =
        notifications.find(
          (item) => item._id === notificationId,
        );

      await deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter(
          (item) => item._id !== notificationId,
        ),
      );

      if (
        notificationToDelete &&
        !notificationToDelete.isRead
      ) {
        setUnreadCount((current) =>
          Math.max(current - 1, 0),
        );
      }

      toast.success("Notification deleted.", {
        id: "therapist-notification-delete-success",
      });
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete the notification. Please try again.",
        { id: "therapist-notification-delete-error" },
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-10 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/20 blur-3xl" />
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Left */}

          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-extrabold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
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

          <div className="flex items-center gap-2">
            {/* Back to dashboard */}

            <a
              href="/therapist/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <span aria-hidden="true">←</span>
              Back to Dashboard
            </a>

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
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
        {/* Page heading */}

        <div className="mb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700 shadow-sm backdrop-blur-sm">
              <Bell size={12} />
              Therapist Portal
            </span>

            {unreadCount > 0 && (
              <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[9px] font-extrabold text-violet-700">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="mt-3">
            <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Your Notifications
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Keep track of session bookings, reminders, shared notes and new
              messages from your practice.
            </p>
          </div>
        </div>

        <section className="mb-7 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={<Bell size={16} />}
            label="Total"
            value={notifications.length}
            description="Notifications in your inbox"
          />

          <SummaryCard
            icon={<MessageCircle size={16} />}
            label="Unread"
            value={unreadCount}
            description={
              unreadCount > 0
                ? "Tap a notification to mark it read"
                : "You're all caught up"
            }
            accent="violet"
          />

          <SummaryCard
            icon={<CheckCircle2 size={16} />}
            label="Updates"
            value="Live"
            description="Bookings, notes, reminders and chat"
            accent="emerald"
          />
        </section>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
            <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm font-medium text-slate-500">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading notifications...
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="rounded-[26px] border border-red-100 bg-gradient-to-r from-red-50 via-white to-rose-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Bell size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-800">
                  Unable to load notifications
                </p>

                <p className="mt-1 text-sm leading-6 text-red-600">
              {error}
                </p>

                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-5 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.22)]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-100/60 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-100/60 blur-2xl" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm ring-8 ring-violet-50">
                <Bell size={25} />
              </div>

              <span className="mt-6 rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                All caught up
              </span>

              <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">
                Nothing new right now
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                New session bookings, reminders, shared notes and chat updates
                will automatically appear here.
              </p>
            </div>
          )}

        {/* =====================================================
            NOTIFICATIONS LIST
        ====================================================== */}

        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(
                  notification.type,
                );

                return (
                  <div
                    key={notification._id}
                    className={`group relative flex gap-4 border-b border-slate-100 px-5 py-5 transition last:border-b-0 sm:px-6 ${
                      notification.isRead
                        ? "bg-white hover:bg-slate-50/70"
                        : "bg-gradient-to-r from-violet-50/80 via-white to-indigo-50/30 hover:from-violet-50"
                    }`}
                  >
                    {!notification.isRead && (
                      <span className="absolute left-0 top-5 h-10 w-1 rounded-r-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                    )}

                    {/* Notification Icon */}

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                        notification.isRead
                          ? "bg-slate-100 text-slate-500"
                          : "bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 ring-1 ring-violet-100"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Content */}

                    <button
                      type="button"
                      onClick={() =>
                        handleMarkAsRead(notification)
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3
                            className={`truncate text-sm ${
                              notification.isRead
                                ? "font-semibold text-slate-700"
                                : "font-extrabold text-slate-900"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600 shadow-[0_0_0_4px_rgba(124,58,237,0.08)]" />
                          )}
                        </div>

                        <span
                          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] sm:inline-flex ${
                            notification.isRead
                              ? "bg-slate-100 text-slate-400"
                              : "bg-violet-100 text-violet-700"
                          }`}
                        >
                          {formatNotificationType(notification.type)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-[10px] font-semibold text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </p>

                        <span className="h-1 w-1 rounded-full bg-slate-200" />

                        <p className="text-[10px] font-medium text-slate-400">
                          {formatNotificationType(notification.type)}
                        </p>
                      </div>
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteNotification(
                          notification._id,
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-300 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
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
   SUMMARY CARD
========================================================= */

function SummaryCard({ icon, label, value, description, accent = "slate" }) {
  const variants = {
    slate: {
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-900",
      border: "border-slate-200/80",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700",
      value: "text-violet-700",
      border: "border-violet-100",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-700",
      border: "border-emerald-100",
    },
  };

  const style = variants[accent] || variants.slate;

  return (
    <div
      className={`rounded-[22px] border bg-white p-4 shadow-[0_14px_45px_-30px_rgba(15,23,42,0.20)] ${style.border}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.icon}`}>
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className={`mt-0.5 text-xl font-extrabold tracking-tight ${style.value}`}>
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-400">
        {description}
      </p>
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

    case "CHAT_MESSAGE":
      return MessageCircle;

    default:
      return Bell;
  }
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

    case "CHAT_MESSAGE":
      return "Chat Message";

    default:
      return "Notification";
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

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60),
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min${
      minutes > 1 ? "s" : ""
    } ago`;
  }

  if (hours < 24) {
    return `${hours} hour${
      hours > 1 ? "s" : ""
    } ago`;
  }

  if (days < 7) {
    return `${days} day${
      days > 1 ? "s" : ""
    } ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default TherapistNotifications;