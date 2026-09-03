import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import { getMyNotifications } from "../../api/notificationApi";
import { getMySessions } from "../../api/sessionApi";
import { getMyPayments } from "../../api/paymentApi";

/* =========================================================
   HELPERS
========================================================= */

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const normalizeStatus = (status) => String(status || "").toUpperCase();

const getStatusLabel = (status) => {
  switch (normalizeStatus(status)) {
    case "CONFIRMED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
};

const getStatusClass = (status) => {
  switch (normalizeStatus(status)) {
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-600";
    case "COMPLETED":
      return "bg-slate-100 text-slate-600";
    case "CANCELLED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-amber-50 text-amber-600";
  }
};

const normalizeDate = (date) => {
  if (!date) return "";
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
  if (!time) return "—";

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
  if (!date) return "—";

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

const formatNotificationTime = (createdAt) => {
  if (!createdAt) return "";

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

const formatCurrency = (amount, currency = "INR") => {
  const numericAmount = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

const getInitials = (name) => {
  const value = String(name || "Y").trim();

  if (!value) return "Y";

  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getSessionTherapistName = (session) => {
  return session?.therapist?.name || session?.therapistName || "Therapist";
};

const getSessionType = (session) => {
  return session?.type || session?.sessionType || "Therapy Session";
};

const getPaymentAmount = (payment) => {
  return Number(
    payment?.amount ?? payment?.amountPaid ?? payment?.netAmount ?? 0,
  );
};

const getPaymentStatusLabel = (status) => {
  switch (normalizeStatus(status)) {
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    case "CREATED":
      return "Created";
    default:
      return status || "Unknown";
  }
};

const getPaymentStatusClass = (status) => {
  switch (normalizeStatus(status)) {
    case "PAID":
      return "text-emerald-600";
    case "FAILED":
      return "text-red-600";
    case "REFUNDED":
      return "text-amber-600";
    default:
      return "text-slate-500";
  }
};

/* =========================================================
   PAGE
========================================================= */

function ClientPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================================================
     DATA
  ========================================================== */

  const [sessionData, setSessionData] = useState({
    upcoming: [],
    completed: [],
    cancelled: [],
  });

  const [payments, setPayments] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* =========================================================
     UI STATE
  ========================================================== */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notificationError, setNotificationError] = useState("");

  /* =========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================== */

  const fetchNotifications = async () => {
    try {
      setNotificationError("");

      const response = await getMyNotifications();
      const notificationData = response?.data || {};

      setNotifications(
        Array.isArray(notificationData?.notifications)
          ? notificationData.notifications
          : [],
      );

      setUnreadCount(Number(notificationData?.unreadCount || 0));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      setNotificationError(
        error?.response?.data?.message || "Failed to load notifications.",
      );
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

      const [sessionsResponse, paymentsResponse] = await Promise.all([
        getMySessions(),
        getMyPayments(),
      ]);

      const sessions = sessionsResponse?.data || {};

      const normalizedSessions = {
        upcoming: Array.isArray(sessions?.upcoming) ? sessions.upcoming : [],
        completed: Array.isArray(sessions?.completed) ? sessions.completed : [],
        cancelled: Array.isArray(sessions?.cancelled) ? sessions.cancelled : [],
      };

      const paymentList = Array.isArray(paymentsResponse?.data)
        ? paymentsResponse.data
        : [];

      setSessionData(normalizedSessions);
      setPayments(paymentList);
    } catch (error) {
      console.error("Failed to fetch client dashboard:", error);

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
     REFRESH NOTIFICATIONS
  ========================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     DERIVED DATA
  ========================================================== */

  const upcomingSessions = useMemo(() => {
    return [...sessionData.upcoming].sort(
      (a, b) => getSessionDateTime(a) - getSessionDateTime(b),
    );
  }, [sessionData.upcoming]);

  const recentSessions = useMemo(() => {
    const allSessions = [
      ...sessionData.completed,
      ...sessionData.cancelled,
      ...sessionData.upcoming,
    ];

    const uniqueSessions = new Map();

    allSessions.forEach((session) => {
      if (session?._id) {
        uniqueSessions.set(session._id, session);
      }
    });

    return [...uniqueSessions.values()]
      .sort((a, b) => getSessionDateTime(b) - getSessionDateTime(a))
      .slice(0, 3);
  }, [sessionData]);

  const nextSession = upcomingSessions[0] || null;

  const recentPayment = useMemo(() => {
    if (!payments.length) {
      return null;
    }

    return [...payments].sort((a, b) => {
      const first = new Date(a?.createdAt || a?.paidAt || 0).getTime();
      const second = new Date(b?.createdAt || b?.paidAt || 0).getTime();

      return second - first;
    })[0];
  }, [payments]);

  const latestNotifications = notifications.slice(0, 3);

  const userName = user?.name || user?.firstName || "Client";

  /* =========================================================
     SIDEBAR
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
      path: "/client/payments",
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
      icon: <FileTextIcon />,
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

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center">
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
      <div className="min-h-screen bg-slate-50 px-5 text-slate-900">
        <div className="flex min-h-screen items-center justify-center">
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
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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

              <p className="text-[10px] text-slate-500">Client Portal</p>
            </div>
          </Link>

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
                    className={active ? "text-violet-600" : "text-slate-400"}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
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
        {/* Premium Header */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[78px] items-center justify-between px-4 sm:px-7 lg:px-10">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu
                size={20}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            {/* Desktop Portal Identity */}
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">
                  Client Portal
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  Your therapy dashboard
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {/* Refresh */}
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : "transition-transform duration-300 group-hover:rotate-180"
                  }
                />
              </button>

              {/* Notifications */}
              <Link
                to="/client/notifications"
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 hover:text-violet-600"
              >
                <Bell
                  size={19}
                  className="transition-transform duration-200 group-hover:-rotate-6"
                />

                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-violet-600 to-indigo-600 px-1 text-[8px] font-bold text-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="mx-1 hidden h-9 w-px bg-slate-200 sm:block" />

              {/* Profile */}
              <Link
                to="/client/profile"
                className="group flex items-center gap-2 rounded-2xl border border-transparent py-1.5 pl-1.5 pr-2 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 via-violet-50 to-indigo-100 text-xs font-bold text-violet-700 shadow-sm ring-1 ring-violet-100 transition-transform duration-200 group-hover:scale-105">
                    {getInitials(userName)}
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-[130px] truncate text-xs font-bold text-slate-900">
                    {userName}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400 transition-colors group-hover:text-violet-500">
                    My Profile
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="hidden text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="relative overflow-hidden bg-slate-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-20 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            {/* Premium Welcome Hero */}
            <section className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-indigo-50/70 shadow-[0_20px_60px_-25px_rgba(99,102,241,0.25)]">
              {/* Decorative Blobs */}
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-indigo-300/15 blur-3xl" />

              {/* Top Accent */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />

              {/* Subtle Grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative flex flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-10">
                {/* Welcome Content */}
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <HeartHandshake size={11} />
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                      Client Portal
                    </span>

                    <span className="h-1 w-1 rounded-full bg-emerald-400" />

                    <span className="text-[9px] font-semibold text-emerald-600">
                      Your space is ready
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      {userName}
                    </span>
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                    Here’s your current therapy activity, upcoming appointments,
                    and everything you need to stay on track.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        Private & Secure
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm">
                      <HeartHandshake size={11} className="text-violet-500" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        Your wellbeing matters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Session CTA */}
                <div className="shrink-0 lg:pr-2">
                  <Link
                    to="/client/therapists"
                    className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-300 sm:w-auto"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      <CalendarDays size={17} />
                    </span>

                    <span className="relative">Book Session</span>

                    <ChevronRight
                      size={15}
                      className="relative transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>

                  <p className="mt-2.5 text-center text-[9px] font-medium text-slate-400">
                    Find a therapist & choose a time
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Upcoming Sessions"
                value={upcomingSessions.length}
                subtitle="Scheduled appointments"
                icon={<CalendarDays size={19} />}
              />

              <SummaryCard
                title="Completed Sessions"
                value={sessionData.completed.length}
                subtitle="From your session history"
                icon={<Clock3 size={19} />}
              />

              <SummaryCard
                title="Last Payment"
                value={
                  recentPayment
                    ? formatCurrency(
                        getPaymentAmount(recentPayment),
                        recentPayment?.currency || "INR",
                      )
                    : "₹0"
                }
                subtitle={
                  recentPayment
                    ? getPaymentStatusLabel(recentPayment.status)
                    : "No payments yet"
                }
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
                {/* Next Session */}

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
                    {nextSession ? (
                      <div className="rounded-2xl bg-violet-50 p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                              <CalendarDays size={21} />
                            </div>

                            <div>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClass(
                                  nextSession.status,
                                )}`}
                              >
                                {getStatusLabel(nextSession.status)}
                              </span>

                              <h3 className="mt-2 text-lg font-bold text-slate-900">
                                {getSessionType(nextSession)}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                with {getSessionTherapistName(nextSession)}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white px-4 py-3 sm:text-right">
                            <p className="text-sm font-bold text-slate-900">
                              {formatDate(nextSession.date)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatTime(nextSession.startTime)}
                              {nextSession.endTime
                                ? ` - ${formatTime(nextSession.endTime)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        title="No upcoming session"
                        description="You currently do not have a scheduled appointment."
                        actionLabel="Book a Session"
                        actionTo="/client/therapists"
                      />
                    )}
                  </div>
                </section>

                {/* My Sessions */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        My Sessions
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Recent and upcoming appointments
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

                  {recentSessions.length === 0 ? (
                    <EmptyState
                      title="No sessions yet"
                      description="Your booked sessions will appear here."
                      actionLabel="Book a Session"
                      actionTo="/client/therapists"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentSessions.map((session) => (
                        <div
                          key={session?._id}
                          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <CalendarDays size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {getSessionType(session)}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {getSessionTherapistName(session)} •{" "}
                                {formatDate(session.date)} •{" "}
                                {formatTime(session.startTime)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold sm:self-auto ${getStatusClass(
                              session.status,
                            )}`}
                          >
                            {getStatusLabel(session.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT */}

              <div className="space-y-6">
                {/* Recent Payment */}

                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Recent Payment
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Latest payment activity
                    </p>
                  </div>

                  <div className="p-5">
                    {recentPayment ? (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <WalletCards size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                Therapy Session
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatDate(
                                  recentPayment?.paidAt ||
                                    recentPayment?.createdAt,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">
                              {formatCurrency(
                                getPaymentAmount(recentPayment),
                                recentPayment?.currency || "INR",
                              )}
                            </p>

                            <p
                              className={`mt-1 text-[10px] font-semibold ${getPaymentStatusClass(
                                recentPayment.status,
                              )}`}
                            >
                              {getPaymentStatusLabel(recentPayment.status)}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/client/payments"
                          className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-violet-600"
                        >
                          View Payments
                          <ChevronRight size={14} />
                        </Link>
                      </>
                    ) : (
                      <EmptyState
                        title="No payment history"
                        description="Your payment activity will appear here after a successful payment."
                        actionLabel="View Payments"
                        actionTo="/client/payments"
                      />
                    )}
                  </div>
                </section>

                {/* Quick Actions */}

                <section className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Quick Actions
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Manage your therapy journey
                    </p>
                  </div>

                  <div className="grid gap-3 p-5">
                    <QuickAction
                      to="/client/therapists"
                      icon={<CalendarDays size={17} />}
                      title="Book a Session"
                      description="Choose a therapist and available slot"
                    />

                    <QuickAction
                      to="/client/notes"
                      icon={<Clock3 size={17} />}
                      title="Shared Notes"
                      description="View notes shared by your therapist"
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
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
                {notificationError ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-xs text-red-500">{notificationError}</p>
                  </div>
                ) : latestNotifications.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Bell size={17} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      You’re all caught up.
                    </p>
                  </div>
                ) : (
                  latestNotifications.map((notification) => (
                    <Link
                      key={notification?._id}
                      to="/client/notifications"
                      className={`flex gap-3 px-5 py-4 transition hover:bg-slate-50 ${
                        !notification?.isRead ? "bg-violet-50/30" : ""
                      }`}
                    >
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          !notification?.isRead
                            ? "bg-violet-600"
                            : "bg-slate-300"
                        }`}
                      />

                      <div className="min-w-0">
                        <p
                          className={`text-sm ${
                            !notification?.isRead
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                          }`}
                        >
                          {notification?.title || "Notification"}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {notification?.message ||
                            "You have a new notification."}
                        </p>

                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {formatNotificationTime(notification?.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* =================================================
                SHARED NOTES
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileTextIcon />
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

function SummaryCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-slate-500">{title}</p>

          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>

          <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet-100 hover:bg-violet-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight size={15} className="shrink-0 text-slate-300" />
    </Link>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   FILE TEXT ICON
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

export default ClientPortal;
