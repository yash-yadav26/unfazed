import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  FileText,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
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
  const [deletingId, setDeletingId] = useState(null);

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

      const notificationData = responseBody?.data ?? responseBody ?? {};

      setNotifications(notificationData?.notifications || []);

      setUnreadCount(notificationData?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      setError(
        error?.response?.data?.message || "Failed to load notifications.",
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

    const differenceInMinutes = Math.floor(differenceInSeconds / 60);

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    }

    const differenceInHours = Math.floor(differenceInMinutes / 60);

    if (differenceInHours < 24) {
      return `${differenceInHours} hour${differenceInHours > 1 ? "s" : ""} ago`;
    }

    const differenceInDays = Math.floor(differenceInHours / 24);

    if (differenceInDays < 7) {
      return `${differenceInDays} day${differenceInDays > 1 ? "s" : ""} ago`;
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

      setUnreadCount((previousCount) => Math.max(previousCount - 1, 0));
      toast.success("Notification marked as read.");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to mark the notification as read. Please try again.",
      );
    }
  };

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================== */

  const handleDeleteNotification = async (notification, event) => {
    event?.stopPropagation();

    if (!notification?._id || deletingId) {
      return;
    }

    try {
      setDeletingId(notification._id);

      await deleteNotification(notification._id);

      setNotifications((previousNotifications) =>
        previousNotifications.filter((item) => item._id !== notification._id),
      );

      if (!notification.isRead) {
        setUnreadCount((previousCount) => Math.max(previousCount - 1, 0));
      }

      toast.success("Notification deleted.");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to delete the notification. Please try again.",
      );
    } finally {
      setDeletingId(null);
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
          readAt: notification.readAt || new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to mark all notifications as read. Please try again.",
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}

          <Link to="/client" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Client Portal</p>
            </div>
          </Link>

          {/* Notification Count + Profile */}

          <div className="flex items-center gap-4">
            <div className="relative rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-2.5 text-violet-700 shadow-sm">
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-1.5 text-[8px] font-extrabold text-white shadow-md shadow-violet-200 ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Profile */}

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-xs font-extrabold text-violet-700 ring-4 ring-white shadow-sm">
                Y
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">Client</p>

                <p className="text-[10px] text-slate-400">My Profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl">
          {/* Back */}

          <Link
            to="/client"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm">
                  <Bell size={20} />
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                    Notifications
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Stay updated with your sessions, payments and other
                    important updates.
                  </p>
                </div>
              </div>

              {/* Mark All Read */}

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllRead}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-xs font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />

                  {markingAllRead ? "Marking..." : "Mark all as read"}
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              NOTIFICATION SUMMARY
          ================================================== */}

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
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
              icon={<ShieldCheck size={16} />}
              label="Stay informed"
              value="Live"
              description="Important updates appear here"
              accent="emerald"
            />
          </section>

          {/* =================================================
              NOTIFICATION LIST
          ================================================== */}

          <section className="mt-7 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
            {/* Header */}

            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/20 to-indigo-50/30 px-5 py-4.5">
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

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm">
                  {notifications.length} total
                </span>
              </div>
            </div>

            {/* List */}

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm ring-8 ring-violet-50">
                    <Bell size={18} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Loading notifications...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">Please wait.</p>
                </div>
              ) : error ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm ring-8 ring-red-50/60">
                    <Bell size={18} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Unable to load notifications
                  </p>

                  <p className="mt-1 text-xs text-red-500">{error}</p>

                  <button
                    type="button"
                    onClick={fetchNotifications}
                    className="mt-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 shadow-sm ring-8 ring-violet-50">
                    <Bell size={22} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    You’ll see important session and account updates here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    deletingId={deletingId}
                    formatTime={formatNotificationTime}
                  />
                ))
              )}
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-medium text-slate-400">
            <ShieldCheck size={13} className="text-violet-400" />
            Important account, session, shared-note and chat updates appear
            here.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ icon, label, value, description, accent = "slate" }) {
  const accentClasses = {
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

  const styles = accentClasses[accent] || accentClasses.slate;

  return (
    <div
      className={`rounded-[22px] border bg-white p-4 shadow-[0_14px_45px_-30px_rgba(15,23,42,0.2)] ${styles.border}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p
            className={`mt-0.5 text-xl font-extrabold tracking-tight ${styles.value}`}
          >
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-400">{description}</p>
    </div>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationItem({ notification, onDelete, deletingId, formatTime }) {
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

      case "CHAT_MESSAGE":
        return <MessageCircle size={18} />;

      default:
        return <Bell size={18} />;
    }
  };

  /* =======================================================
     READ STATUS
  ======================================================== */

  const isUnread = !notification.isRead;

  const isDeleting = deletingId === notification._id;

  return (
    <div
      className={`group relative flex w-full gap-4 px-5 py-5 text-left transition duration-200 hover:bg-violet-50/35 ${
        isUnread ? "bg-violet-50/40" : "bg-white"
      }`}
    >
      {/* Icon */}

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition duration-200 group-hover:scale-[1.03] ${
          isUnread
            ? "bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 ring-1 ring-violet-100"
            : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
              <CheckCircle2 size={12} />
              Unread
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
              Read
            </span>
          )}

          <span className="text-[10px] text-slate-300">•</span>

          <span className="text-[10px] font-medium text-slate-400">
            {formatNotificationType(notification.type)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => onDelete(notification, event)}
        disabled={isDeleting}
        aria-label="Delete notification"
        title="Delete notification"
        className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-xl border border-slate-200 bg-white text-slate-400 opacity-100 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
      >
        {isDeleting ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
        ) : (
          <Trash2 size={15} />
        )}
      </button>
    </div>
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

    case "CHAT_MESSAGE":
      return "Chat Message";

    default:
      return "Notification";
  }
}

export default Notifications;
