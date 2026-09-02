import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { getMyNotifications } from "../../api/notificationApi";

function TherapistDashboard() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await getMyNotifications();

      // Supports the current ApiResponse structure
      // as well as direct response data.
      const responseBody = response?.data ?? response;
      const notificationData = responseBody?.data ?? responseBody ?? {};

      setUnreadCount(notificationData?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch therapist notifications:", error);
    }
  };

  useEffect(() => {
    const initialFetchTimeout = setTimeout(fetchNotifications, 0);

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearTimeout(initialFetchTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <Link
              to="/therapist/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <>
                  {/* Unread count only */}
                  {unreadCount <= 99 && (
                    <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}

                  {unreadCount > 99 && (
                    <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[8px] font-bold text-white shadow-sm">
                      99+
                    </span>
                  )}
                </>
              )}
            </Link>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            {/* Profile */}
            <Link
              to="/therapist/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                Y
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-slate-800">
                  Therapist
                </p>

                <p className="text-[10px] text-slate-400">My Profile</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE LAYOUT
      ====================================================== */}

      <div className="flex">
        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <aside className="hidden min-h-[calc(100vh-64px)] w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
          <nav className="p-4">
            <SidebarLink
              to="/therapist/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active
            />

            <SidebarLink
              to="/therapist/schedule"
              icon={<CalendarDays size={18} />}
              label="Schedule"
            />

            <SidebarLink
              to="/therapist/clients"
              icon={<Users size={18} />}
              label="Clients"
            />

            <SidebarLink
              to="/therapist/notes"
              icon={<FileText size={18} />}
              label="Notes"
            />

            {/* Notifications */}
            <SidebarLink
              to="/therapist/notifications"
              icon={<Bell size={18} />}
              label="Notifications"
              badge={unreadCount}
            />

            <SidebarLink
              to="/therapist/analytics"
              icon={<TrendingUp size={18} />}
              label="Analytics"
            />

            <div className="my-5 h-px bg-slate-100" />

            <SidebarLink
              to="/therapist/profile"
              icon={<UserRound size={18} />}
              label="Profile"
            />
          </nav>
        </aside>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-violet-600">
                  Good morning 👋
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Welcome back, Therapist
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Here’s what’s happening with your practice today.
                </p>
              </div>

              <Link
                to="/therapist/schedule"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <CalendarDays size={17} />
                View Schedule
              </Link>
            </div>

            {/* =================================================
                STAT CARDS
            ================================================== */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Today's Sessions"
                value="6"
                subtitle="+2 from yesterday"
                icon={<CalendarDays size={20} />}
              />

              <StatCard
                title="Active Clients"
                value="24"
                subtitle="+3 this month"
                icon={<Users size={20} />}
              />

              <StatCard
                title="Monthly Revenue"
                value="₹48,500"
                subtitle="+12.5% this month"
                icon={<Wallet size={20} />}
              />

              <StatCard
                title="Completion Rate"
                value="92%"
                subtitle="+4.5% this month"
                icon={<TrendingUp size={20} />}
              />
            </div>

            {/* =================================================
                UPCOMING + TODAY
            ================================================== */}

            <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              {/* Upcoming Sessions */}
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Upcoming Sessions
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Your next scheduled sessions
                    </p>
                  </div>

                  <Link
                    to="/therapist/schedule"
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-700"
                  >
                    View Calendar
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  <SessionRow
                    name="Ananya Sharma"
                    time="10:00 AM"
                    type="Individual Therapy"
                    status="Confirmed"
                  />

                  <SessionRow
                    name="Rahul Mehta"
                    time="11:30 AM"
                    type="Anxiety Support"
                    status="Confirmed"
                  />

                  <SessionRow
                    name="Priya Singh"
                    time="02:00 PM"
                    type="Relationship Counseling"
                    status="Pending"
                  />

                  <SessionRow
                    name="Arjun Verma"
                    time="04:30 PM"
                    type="Individual Therapy"
                    status="Confirmed"
                  />
                </div>
              </section>

              {/* Today's Schedule */}
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-bold text-slate-900">Today</h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Friday, August 16
                  </p>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    <TimelineItem
                      time="10:00"
                      ampm="AM"
                      title="Ananya Sharma"
                      active
                    />

                    <TimelineItem time="11:30" ampm="AM" title="Rahul Mehta" />

                    <TimelineItem time="02:00" ampm="PM" title="Priya Singh" />

                    <TimelineItem time="04:30" ampm="PM" title="Arjun Verma" />
                  </div>
                </div>
              </section>
            </div>

            {/* =================================================
                LOWER CONTENT
            ================================================== */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Recent Clients */}
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Recent Clients
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Recently active clients
                    </p>
                  </div>

                  <Link
                    to="/therapist/clients"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  <ClientRow
                    name="Ananya Sharma"
                    email="ananya@example.com"
                    session="Today, 10:00 AM"
                    initials="AS"
                  />

                  <ClientRow
                    name="Rahul Mehta"
                    email="rahul@example.com"
                    session="Today, 11:30 AM"
                    initials="RM"
                  />

                  <ClientRow
                    name="Priya Singh"
                    email="priya@example.com"
                    session="Yesterday"
                    initials="PS"
                  />
                </div>
              </section>

              {/* Recent Notes */}
              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Recent Notes
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Latest clinical documentation
                    </p>
                  </div>

                  <Link
                    to="/therapist/notes"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    View Notes
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  <NoteRow
                    client="Ananya Sharma"
                    title="Session follow-up"
                    date="Today"
                  />

                  <NoteRow
                    client="Rahul Mehta"
                    title="Anxiety support session"
                    date="Yesterday"
                  />

                  <NoteRow
                    client="Priya Singh"
                    title="Relationship counseling"
                    date="14 Aug 2026"
                  />
                </div>
              </section>
            </div>

            {/* =================================================
                ANALYTICS PREVIEW
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <TrendingUp size={18} />
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                      Practice Overview
                    </h2>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Track sessions, clients, revenue and practice performance
                    from your analytics dashboard.
                  </p>
                </div>

                <Link
                  to="/therapist/analytics"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  Open Analytics
                  <ChevronRight size={14} />
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({ to, icon, label, active = false, badge = 0 }) {
  return (
    <Link
      to={to}
      className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>

      {badge > 0 && (
        <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SESSION ROW
========================================================= */

function SessionRow({ name, time, type, status }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
          {getInitials(name)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {name}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-400">{type}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-slate-700">{time}</p>

        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            status === "Confirmed"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   TIMELINE ITEM
========================================================= */

function TimelineItem({ time, ampm, title, active = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 shrink-0 text-right">
        <p className="text-xs font-bold text-slate-700">{time}</p>

        <p className="text-[10px] text-slate-400">{ampm}</p>
      </div>

      <div
        className={`h-3 w-3 shrink-0 rounded-full ${
          active ? "bg-violet-600 ring-4 ring-violet-100" : "bg-slate-300"
        }`}
      />

      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
        <p className="truncate text-xs font-semibold text-slate-700">{title}</p>

        <p className="mt-0.5 text-[10px] text-slate-400">Therapy session</p>
      </div>
    </div>
  );
}

/* =========================================================
   CLIENT ROW
========================================================= */

function ClientRow({ name, email, session, initials }) {
  return (
    <Link
      to="/therapist/clients"
      className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {name}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-slate-400">{email}</p>
        </div>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-3">
        <p className="hidden text-[11px] text-slate-400 sm:block">{session}</p>

        <ChevronRight size={15} className="text-slate-300" />
      </div>
    </Link>
  );
}

/* =========================================================
   NOTE ROW
========================================================= */

function NoteRow({ client, title, date }) {
  return (
    <Link
      to="/therapist/notes"
      className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <FileText size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-1 truncate text-[11px] text-slate-400">
          {client} • {date}
        </p>
      </div>

      <ChevronRight size={15} className="shrink-0 text-slate-300" />
    </Link>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default TherapistDashboard;
