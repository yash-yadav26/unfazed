import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  UserRound,
  WalletCards,
  Menu,
  X,
} from "lucide-react";

function ClientPortal() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================================================
     MOCK DATA
  ========================================================== */

  const notifications = [
    {
      id: 1,
      title: "Session confirmed",
      description:
        "Your session with Dr. Sharma has been confirmed.",
      time: "10 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Session reminder",
      description:
        "You have a therapy session tomorrow at 10:00 AM.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment received",
      description:
        "Your payment of ₹1,000 was successfully recorded.",
      time: "Yesterday",
      unread: false,
    },
  ];

  const upcomingSession = {
    therapistName: "Dr. Sharma",
    sessionType: "Individual Therapy",
    date: "18 August 2026",
    time: "10:00 AM",
    status: "Confirmed",
  };

  const packageInfo = {
    name: "6 Session Package",
    totalSessions: 6,
    remainingSessions: 3,
    expiry: "30 September 2026",
  };

  const recentPayment = {
    amount: 1000,
    date: "16 August 2026",
    status: "Paid",
  };

  const conversations = [
    {
      id: 1,
      therapistName: "Dr. Sharma",
      message: "Looking forward to our next session.",
      time: "Yesterday",
    },
  ];

  const sessions = [
    {
      id: 1,
      therapistName: "Dr. Sharma",
      type: "Individual Therapy",
      date: "18 Aug 2026",
      time: "10:00 AM",
      status: "Upcoming",
    },
    {
      id: 2,
      therapistName: "Dr. Sharma",
      type: "Individual Therapy",
      date: "12 Aug 2026",
      time: "10:00 AM",
      status: "Completed",
    },
    {
      id: 3,
      therapistName: "Dr. Sharma",
      type: "Anxiety Support",
      date: "05 Aug 2026",
      time: "10:00 AM",
      status: "Completed",
    },
  ];

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  /* =========================================================
     SIDEBAR ITEMS
  ========================================================== */

  const sidebarItems = [
    {
      label: "Dashboard",
      path: "/client",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Book Session",
      path: "/client/therapists",
      icon: <CalendarDays size={18} />,
    },
    {
      label: "My Sessions",
      path: "/client/sessions",
      icon: <Clock3 size={18} />,
    },
    {
      label: "Payments",
      path: "/client/payment",
      icon: <WalletCards size={18} />,
    },
    {
      label: "Notifications",
      path: "/client/notifications",
      icon: <Bell size={18} />,
      badge: unreadCount,
    },
    {
      label: "Shared Notes",
      path: "/client/notes",
      icon: <FileText size={18} />,
    },
    {
      label: "Profile",
      path: "/client/profile",
      icon: <UserRound size={18} />,
    },
  ];

  const isActivePath = (path) => {
    if (path === "/client") {
      return location.pathname === "/client";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[78px] items-center border-b border-slate-100 px-5">
          <Link
            to="/client"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <HeartHandshake size={21} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[10px] text-slate-500">
                Client Portal
              </p>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            My Portal
          </p>

          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const active = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span
                    className={
                      active
                        ? "text-violet-600"
                        : "text-slate-400"
                    }
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>

                  {item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN WRAPPER
      ====================================================== */}

      <div className="lg:pl-[270px]">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-[78px] items-center justify-between px-5 sm:px-8 lg:px-10">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* Desktop title */}
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-slate-400">
                Client Portal
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                Your therapy dashboard
              </p>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-4">
              {/* Notification */}
              <Link
                to="/client/notifications"
                className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-violet-600"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="h-7 w-px bg-slate-200" />

              {/* Profile */}
              <Link
                to="/client/profile"
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  Y
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800">
                    Yash
                  </p>

                  <p className="text-[10px] text-slate-400">
                    My Profile
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="px-5 py-7 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {/* =================================================
                WELCOME
            ================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                  Client Portal
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Welcome back, Yash
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Here’s everything you need for your therapy journey.
                </p>
              </div>

              <Link
                to="/client/therapists"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <CalendarDays size={16} />
                Book Session
              </Link>
            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Upcoming Session"
                value="1"
                subtitle="Next appointment"
                icon={<CalendarDays size={19} />}
              />

              <SummaryCard
                title="Sessions Left"
                value={packageInfo.remainingSessions}
                subtitle={packageInfo.name}
                icon={<Clock3 size={19} />}
              />

              <SummaryCard
                title="Last Payment"
                value={`₹${recentPayment.amount.toLocaleString(
                  "en-IN",
                )}`}
                subtitle={recentPayment.status}
                icon={<WalletCards size={19} />}
              />

              <SummaryCard
                title="Unread"
                value={unreadCount}
                subtitle="Notifications"
                icon={<Bell size={19} />}
              />
            </div>

            {/* =================================================
                MAIN GRID
            ================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
              {/* LEFT */}
              <div className="space-y-6">
                {/* Upcoming Session */}
                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Upcoming Session
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Your next scheduled appointment
                      </p>
                    </div>

                    <Link
                      to="/client/sessions"
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      View Sessions
                    </Link>
                  </div>

                  <div className="p-5">
                    <div className="rounded-2xl bg-violet-50 p-5">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                            <CalendarDays size={21} />
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">
                              {upcomingSession.status}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {upcomingSession.sessionType}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              with{" "}
                              {upcomingSession.therapistName}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white px-4 py-3 sm:text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {upcomingSession.date}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {upcomingSession.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Sessions */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        My Sessions
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Your recent and upcoming sessions
                      </p>
                    </div>

                    <Link
                      to="/client/sessions"
                      className="flex items-center gap-1 text-xs font-semibold text-violet-600"
                    >
                      View all
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <CalendarDays size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {session.type}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {session.therapistName} •{" "}
                              {session.date} •{" "}
                              {session.time}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold sm:self-auto ${
                            session.status ===
                            "Upcoming"
                              ? "bg-violet-50 text-violet-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* RIGHT */}
              <div className="space-y-6">
                {/* Package */}
                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      My Package
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Your current session package
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {packageInfo.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Expires {packageInfo.expiry}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-violet-700">
                            {
                              packageInfo.remainingSessions
                            }
                          </p>

                          <p className="text-[10px] text-slate-400">
                            sessions left
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-violet-600"
                          style={{
                            width: `${
                              ((packageInfo.totalSessions -
                                packageInfo.remainingSessions) /
                                packageInfo.totalSessions) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                        <span>
                          {packageInfo.totalSessions -
                            packageInfo.remainingSessions}{" "}
                          used
                        </span>

                        <span>
                          {packageInfo.totalSessions} total
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/client/payment"
                      className="mt-4 flex h-10 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                    >
                      View Packages
                    </Link>
                  </div>
                </section>

                {/* Recent Payment */}
                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Recent Payment
                    </h2>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <WalletCards size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Therapy Session
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {recentPayment.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                          ₹
                          {recentPayment.amount.toLocaleString(
                            "en-IN",
                          )}
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                          {recentPayment.status}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/client/payment"
                      className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-violet-600"
                    >
                      View Payments
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </section>
              </div>
            </div>

            {/* =================================================
                BOTTOM GRID
            ================================================== */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Notifications */}
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Notifications
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Your latest updates
                    </p>
                  </div>

                  <Link
                    to="/client/notifications"
                    className="flex items-center gap-1 text-xs font-semibold text-violet-600"
                  >
                    View all
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-3 px-5 py-4"
                      >
                        <div
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            notification.unread
                              ? "bg-violet-600"
                              : "bg-slate-300"
                          }`}
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {
                              notification.description
                            }
                          </p>

                          <p className="mt-1.5 text-[10px] text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>

              {/* Messages */}
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Messages
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Talk to your therapist
                    </p>
                  </div>

                  <Link
                    to="/client/chat"
                    className="text-xs font-semibold text-violet-600"
                  >
                    Open Chat
                  </Link>
                </div>

                <div className="p-5">
                  {conversations.map(
                    (conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                          <MessageCircle
                            size={17}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">
                              {
                                conversation.therapistName
                              }
                            </p>

                            <span className="text-[10px] text-slate-400">
                              {
                                conversation.time
                              }
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {conversation.message}
                          </p>
                        </div>
                      </div>
                    ),
                  )}

                  <Link
                    to="/client/chat"
                    className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-violet-600"
                  >
                    Open Messages
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </section>
            </div>

            {/* =================================================
                SHARED NOTES
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileText size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Shared Notes
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Notes shared with you by your therapist.
                    </p>
                  </div>
                </div>

                <Link
                  to="/client/notes"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  View Shared Notes
                  <ChevronRight size={14} />
                </Link>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-5 text-center text-[11px] text-slate-400">
              Your therapy information is kept private and protected.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default ClientPortal;