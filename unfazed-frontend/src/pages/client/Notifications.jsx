import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  HeartHandshake,
} from "lucide-react";

function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "session",
      title: "Session confirmed",
      description:
        "Your session with Dr. Sharma has been confirmed.",
      time: "10 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "reminder",
      title: "Session reminder",
      description:
        "You have a therapy session tomorrow at 10:00 AM.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "payment",
      title: "Payment received",
      description:
        "Your payment of ₹1,000 was successfully recorded.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 4,
      type: "session",
      title: "Session completed",
      description:
        "Your therapy session has been marked as completed.",
      time: "2 days ago",
      unread: false,
    },
  ];

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

          {/* Heading */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Bell size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with your sessions, payments and
                  other important updates.
                </p>
              </div>
            </div>
          </div>

          {/* Notification List */}
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">
                All Notifications
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your latest notifications
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          </section>

          {/* Footer */}
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

function NotificationItem({ notification }) {
  const getIcon = () => {
    switch (notification.type) {
      case "payment":
        return <CreditCard size={18} />;

      case "reminder":
        return <Bell size={18} />;

      case "session":
      default:
        return <CalendarDays size={18} />;
    }
  };

  return (
    <div
      className={`flex gap-4 px-5 py-5 transition ${
        notification.unread
          ? "bg-violet-50/40"
          : "bg-white"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          notification.unread
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
            <h3 className="text-sm font-semibold text-slate-800">
              {notification.title}
            </h3>

            {notification.unread && (
              <span className="h-2 w-2 rounded-full bg-violet-600" />
            )}
          </div>

          <span className="text-[10px] text-slate-400">
            {notification.time}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {notification.description}
        </p>

        {notification.unread && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-violet-600">
            <CheckCircle2 size={12} />
            Unread
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;