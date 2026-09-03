import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { getMyNotifications } from "../../api/notificationApi";
import { getMyClients } from "../../api/clientApi";
import {
  getAnalyticsOverview,
  getRevenueTrend,
} from "../../api/therapistAnalyticsApi";

/* =========================================================
   HELPERS
========================================================= */

const getTodayDateString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDate = (date) => {
  if (!date) {
    return "";
  }

  return String(date).slice(0, 10);
};

const getSessionDateTime = (session) => {
  if (!session?.date || !session?.startTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  const date = normalizeDate(session.date);

  const [hours = 0, minutes = 0] = String(session.startTime)
    .split(":")
    .map(Number);

  const dateTime = new Date(`${date}T00:00:00`);

  dateTime.setHours(hours, minutes, 0, 0);

  return dateTime.getTime();
};

const formatTime = (time) => {
  if (!time) {
    return "—";
  }

  const [hours, minutes] = String(time).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const normalized = normalizeDate(date);

  const parsedDate = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTodayLabel = () => {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const normalizeStatus = (status) => {
  return String(status || "").toUpperCase();
};

const isActiveSession = (session) => {
  const status = normalizeStatus(session?.status);

  return ["PENDING", "CONFIRMED"].includes(status);
};

const isVisibleSession = (session) => {
  const status = normalizeStatus(session?.status);

  return status !== "CANCELLED";
};

const getSessionStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case "CONFIRMED":
      return "Confirmed";

    case "PENDING":
      return "Pending";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return normalizedStatus || "Unknown";
  }
};

const getStatusClassName = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "CONFIRMED") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (normalizedStatus === "COMPLETED") {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-amber-50 text-amber-600";
};

const getClientName = (client) => {
  return client?.name || "Client";
};

const getClientEmail = (client) => {
  return client?.email || "No email available";
};

const getInitials = (name) => {
  const value = String(name || "C").trim();

  if (!value) {
    return "C";
  }

  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

/* =========================================================
   PAGE
========================================================= */

function TherapistDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  /* =========================================================
     DATA STATE
  ========================================================== */

  const [clients, setClients] = useState([]);

  const [analyticsOverview, setAnalyticsOverview] = useState({
    revenue: 0,
    activeClients: 0,
  });

  const [revenueTrend, setRevenueTrend] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  /* =========================================================
     UI STATE
  ========================================================== */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());

    updateCurrentTime();

    const intervalId = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================== */

  const fetchNotifications = async () => {
    try {
      const response = await getMyNotifications();

      const responseBody = response?.data ?? response;
      const notificationData = responseBody?.data ?? responseBody ?? {};

      setUnreadCount(notificationData?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch therapist notifications:", error);
    }
  };

  /* =========================================================
     FETCH DASHBOARD DATA
  ========================================================== */

  const fetchDashboard = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [clientsResponse, overviewResponse, revenueResponse] =
        await Promise.all([
          getMyClients(),
          getAnalyticsOverview(),
          getRevenueTrend(),
        ]);

      const clientData = Array.isArray(clientsResponse?.data)
        ? clientsResponse.data
        : [];

      const overviewData = overviewResponse?.data || {
        revenue: 0,
        activeClients: 0,
      };

      const revenueData = Array.isArray(revenueResponse?.data)
        ? revenueResponse.data
        : [];

      setClients(clientData);
      setAnalyticsOverview(overviewData);
      setRevenueTrend(revenueData);
    } catch (error) {
      console.error("Failed to fetch therapist dashboard:", error);

      setError(
        error?.response?.data?.message ||
          "Unable to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDashboard();
      fetchNotifications();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  /* =========================================================
     NOTIFICATION POLLING
  ========================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     FLATTEN CLIENT SESSIONS
  ========================================================== */

  const allSessions = useMemo(() => {
    const sessions = [];

    clients.forEach((client) => {
      const clientSessions = Array.isArray(client?.sessions)
        ? client.sessions
        : [];

      clientSessions.forEach((session) => {
        sessions.push({
          ...session,
          clientId: client?._id,
          clientName: getClientName(client),
          clientEmail: getClientEmail(client),
        });
      });
    });

    return sessions;
  }, [clients]);

  /* =========================================================
     TODAY'S SESSIONS
  ========================================================== */

  const todaySessions = useMemo(() => {
    const today = getTodayDateString();

    return allSessions
      .filter((session) => {
        return (
          normalizeDate(session?.date) === today && isVisibleSession(session)
        );
      })
      .sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b));
  }, [allSessions]);

  /* =========================================================
     UPCOMING SESSIONS
  ========================================================== */

  const upcomingSessions = useMemo(() => {
    return allSessions
      .filter((session) => {
        if (!isActiveSession(session)) {
          return false;
        }

        return getSessionDateTime(session) >= currentTime;
      })
      .sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b))
      .slice(0, 4);
  }, [allSessions, currentTime]);

  /* =========================================================
     RECENT CLIENTS
  ========================================================== */

  const recentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => {
        const aSessions = Array.isArray(a?.sessions) ? a.sessions : [];

        const bSessions = Array.isArray(b?.sessions) ? b.sessions : [];

        const latestA = aSessions.length
          ? Math.max(...aSessions.map(getSessionDateTime))
          : 0;

        const latestB = bSessions.length
          ? Math.max(...bSessions.map(getSessionDateTime))
          : 0;

        return latestB - latestA;
      })
      .slice(0, 3);
  }, [clients]);

  /* =========================================================
     TODAY'S SESSION COUNT
  ========================================================== */

  const todaysSessionsCount = todaySessions.length;

  /* =========================================================
     CURRENT MONTH REVENUE
     Revenue trend API se current month ka revenue derive
     kar rahe hain.
  ========================================================== */

  const monthlyRevenue = useMemo(() => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthData = revenueTrend.find((item) => {
      return (
        Number(item?.year) === currentYear &&
        Number(item?.monthNumber) === currentMonth
      );
    });

    return Number(currentMonthData?.revenue || 0);
  }, [revenueTrend]);

  /* =========================================================
     DISPLAY HELPERS
  ========================================================== */

  const activeClients = Number(analyticsOverview?.activeClients || 0);

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
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
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw size={17} className="animate-spin" />
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
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
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-5">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              Unable to load dashboard
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================== */

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
            {/* Refresh */}

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            {/* Notification */}

            <Link
              to="/therapist/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            {/* Profile */}

            <Link
              to="/therapist/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                T
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
              icon={<FileTextIcon />}
              label="Notes"
            />

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

            <div className="my-5 h-px bg-slate-100" />

            <button
              type="button"
              onClick={handleLogout}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
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

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Today's Sessions"
                value={todaysSessionsCount}
                subtitle="Scheduled for today"
                icon={<CalendarDays size={20} />}
              />

              <StatCard
                title="Active Clients"
                value={activeClients}
                subtitle="Clients with active sessions"
                icon={<Users size={20} />}
              />

              <StatCard
                title="Monthly Revenue"
                value={formatCurrency(monthlyRevenue)}
                subtitle="Current month paid revenue"
                icon={<Wallet size={20} />}
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
                    to="/therapist/clients"
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-700"
                  >
                    View All
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  <EmptyState
                    title="No upcoming sessions"
                    description="You do not have any upcoming confirmed or pending sessions."
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {upcomingSessions.map((session) => (
                      <SessionRow
                        key={session?._id}
                        name={session.clientName}
                        time={formatTime(session.startTime)}
                        date={formatDate(session.date)}
                        type="Therapy Session"
                        status={getSessionStatusLabel(session.status)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Today's Schedule */}

              <section className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-bold text-slate-900">Today</h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatTodayLabel()}
                  </p>
                </div>

                <div className="p-5">
                  {todaySessions.length === 0 ? (
                    <EmptyState
                      title="No sessions today"
                      description="Your schedule is clear for today."
                    />
                  ) : (
                    <div className="space-y-4">
                      {todaySessions.map((session, index) => (
                        <TimelineItem
                          key={session?._id}
                          time={formatTime(session.startTime)}
                          title={session.clientName}
                          status={getSessionStatusLabel(session.status)}
                          active={index === 0}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* =================================================
                LOWER CONTENT
            ================================================== */}

            <div className="mt-6">
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
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-700"
                  >
                    View All
                  </Link>
                </div>

                {recentClients.length === 0 ? (
                  <EmptyState
                    title="No clients yet"
                    description="Clients will appear here after they book sessions with you."
                  />
                ) : (
                  <div className="divide-y divide-slate-100 p-2">
                    {recentClients.map((client) => {
                      const clientSessions = Array.isArray(client?.sessions)
                        ? client.sessions
                        : [];

                      const latestSession = [...clientSessions].sort(
                        (a, b) => getSessionDateTime(b) - getSessionDateTime(a),
                      )[0];

                      const sessionText = latestSession
                        ? `${formatDate(latestSession.date)}, ${formatTime(
                            latestSession.startTime,
                          )}`
                        : "No sessions";

                      return (
                        <ClientRow
                          key={client?._id}
                          name={getClientName(client)}
                          email={getClientEmail(client)}
                          session={sessionText}
                          initials={getInitials(getClientName(client))}
                        />
                      );
                    })}
                  </div>
                )}
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
                    Track revenue and client performance from your analytics
                    dashboard.
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

function SessionRow({ name, time, date, type, status }) {
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

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {type} • {date}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-slate-700">{time}</p>

        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClassName(
            status,
          )}`}
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

function TimelineItem({ time, title, status, active = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 shrink-0 text-right">
        <p className="text-xs font-bold text-slate-700">{time}</p>
      </div>

      <div
        className={`h-3 w-3 shrink-0 rounded-full ${
          active ? "bg-violet-600 ring-4 ring-violet-100" : "bg-slate-300"
        }`}
      />

      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs font-semibold text-slate-700">
            {title}
          </p>

          <span className="shrink-0 text-[10px] font-medium text-slate-400">
            {status}
          </span>
        </div>

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
   EMPTY STATE
========================================================= */

function EmptyState({ title, description }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FILE TEXT ICON
   Notes sidebar ke liye lightweight icon wrapper.
========================================================= */

function FileTextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

export default TherapistDashboard;
