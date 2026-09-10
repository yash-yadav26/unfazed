import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  X,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Video,
  Loader2,
} from "lucide-react";

import { getMyNotifications } from "../../api/notificationApi";
import { getMyClients } from "../../api/clientApi";
import {
  getAnalyticsOverview,
  getRevenueTrend,
} from "../../api/therapistAnalyticsApi";
import { joinSession } from "../../api/sessionApi";
import toast from "react-hot-toast";

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

const getSessionEndDateTime = (session) => {
  if (!session?.date || !session?.endTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  const date = normalizeDate(session.date);

  const [hours = 0, minutes = 0] = String(session.endTime)
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

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const getStoredTherapist = () => {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : {};
  } catch {
    return {};
  }
};

const getTherapistDisplayName = (user) => {
  const firstName =
    user?.firstName || user?.firstname || user?.name?.split(" ")?.[0] || "";

  const lastName =
    user?.lastName ||
    user?.lastname ||
    user?.name?.split(" ")?.slice(1).join(" ") ||
    "";

  return `${firstName} ${lastName}`.trim() || "Therapist";
};

const getTherapistInitials = (name) => {
  const value = String(name || "Therapist").trim();

  if (!value) {
    return "T";
  }

  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const normalizeStatus = (status) => {
  return String(status || "").toUpperCase();
};

/* =========================================================
   SESSION STATUS
========================================================= */

const isActiveSession = (session) => {
  const status = normalizeStatus(session?.status);

  return ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(status);
};

const isCurrentSession = (session, currentTime) => {
  const status = normalizeStatus(session?.status);

  if (status !== "IN_PROGRESS") {
    return false;
  }

  const startTime = getSessionDateTime(session);
  const endTime = getSessionEndDateTime(session);

  if (
    startTime === Number.MAX_SAFE_INTEGER ||
    endTime === Number.MAX_SAFE_INTEGER
  ) {
    return false;
  }

  return currentTime >= startTime && currentTime <= endTime;
};

const isJoinableSession = (session, currentTime) => {
  const status = normalizeStatus(session?.status);

  if (!["CONFIRMED", "IN_PROGRESS"].includes(status)) {
    return false;
  }

  const startTime = getSessionDateTime(session);
  const endTime = getSessionEndDateTime(session);

  if (
    startTime === Number.MAX_SAFE_INTEGER ||
    endTime === Number.MAX_SAFE_INTEGER
  ) {
    return false;
  }

  return currentTime >= startTime && currentTime <= endTime;
};

const getJoinButtonText = (session, currentTime) => {
  if (isJoinableSession(session, currentTime)) {
    return "Join Session";
  }

  const status = normalizeStatus(session?.status);

  if (status === "IN_PROGRESS") {
    return "Session in progress";
  }

  const startTime = getSessionDateTime(session);

  if (startTime !== Number.MAX_SAFE_INTEGER && currentTime < startTime) {
    return `Starts at ${formatTime(session?.startTime)}`;
  }

  return "Join unavailable";
};

const getSessionStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case "CONFIRMED":
      return "Confirmed";

    case "PENDING":
      return "Pending";

    case "IN_PROGRESS":
      return "In Progress";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    case "NO_SHOW":
      return "No Show";

    default:
      return normalizedStatus || "Unknown";
  }
};

const getTimelineDotClassName = (status, active) => {
  const normalizedStatus = normalizeStatus(status);

  // Currently running session.
  if (active) {
    return "bg-violet-600 ring-4 ring-violet-100 shadow-lg shadow-violet-200";
  }

  // Future confirmed session.
  if (normalizedStatus === "CONFIRMED") {
    return "bg-slate-300";
  }

  // Completed session.
  if (normalizedStatus === "COMPLETED") {
    return "bg-emerald-500 ring-4 ring-emerald-100 shadow-lg shadow-emerald-200";
  }

  // Missed session.
  if (normalizedStatus === "NO_SHOW") {
    return "bg-orange-400 ring-4 ring-orange-100 shadow-sm shadow-orange-100";
  }

  // Cancelled session.
  if (normalizedStatus === "CANCELLED") {
    return "bg-red-500 ring-4 ring-red-100 shadow-sm shadow-red-100";
  }

  // Pending / unknown.
  return "bg-slate-300";
};

const getStatusClassName = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "CONFIRMED") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (normalizedStatus === "IN_PROGRESS") {
    return "bg-violet-50 text-violet-600";
  }

  if (normalizedStatus === "COMPLETED") {
    return "bg-slate-100 text-slate-600";
  }

  if (normalizedStatus === "CANCELLED") {
    return "bg-red-50 text-red-600";
  }

  if (normalizedStatus === "NO_SHOW") {
    return "bg-orange-50 text-orange-600";
  }

  return "bg-amber-50 text-amber-600";
};

const isVisibleSession = (session) => {
  const status = normalizeStatus(session?.status);

  return status !== "CANCELLED";
};

/* =========================================================
   CLIENT HELPERS
========================================================= */

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
   RECENT BOOKING HELPER
========================================================= */

const getBookingCreatedTime = (session) => {
  const value = session?.createdAt || session?.bookedAt;

  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
};

const getLatestBookedSession = (sessions) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  return [...sessions].sort(
    (a, b) => getBookingCreatedTime(b) - getBookingCreatedTime(a),
  )[0];
};

/* =========================================================
   PAGE
========================================================= */

function TherapistDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const therapistUser = useMemo(() => getStoredTherapist(), []);

  const therapistName = getTherapistDisplayName(therapistUser);

  const therapistInitials = getTherapistInitials(therapistName);

  const greeting = getGreeting();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";

  const SOCKET_URL = API_BASE_URL
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

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

  const [joiningSessionId, setJoiningSessionId] = useState(null);

  const [todayPage, setTodayPage] = useState(1);

  const TODAY_SESSIONS_PER_PAGE = 5;

  /* =========================================================
     CURRENT TIME
  ========================================================== */

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(Date.now());
    };

    updateCurrentTime();

    const intervalId = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(intervalId);
  }, [SOCKET_URL]);

  /* =========================================================
     JOIN SESSION
  ========================================================== */

  const handleJoinSession = async (session) => {
    if (!session?._id) {
      toast.error("Session details are unavailable.");
      return;
    }

    if (!isJoinableSession(session, currentTime)) {
      toast.error("This session cannot be joined right now.");
      return;
    }

    try {
      setJoiningSessionId(session._id);

      await joinSession(session._id);
      toast.success("Joining session…");

      navigate(`/therapist/sessions/${session._id}/video`);
    } catch (error) {
      console.error("Failed to join session:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to join the session. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setJoiningSessionId(null);
    }
  };

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

      const message =
        error?.response?.data?.message ||
        "Unable to load dashboard. Please try again.";

      setError(message);
      toast.error(message);
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
  }, [SOCKET_URL]);

  /* =========================================================
     NOTIFICATION POLLING
  ========================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [SOCKET_URL]);

  /* =========================================================
     REAL-TIME NOTIFICATION UPDATES
  ========================================================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["polling", "websocket"],
      upgrade: true,
    });

    socket.on("connect", () => {
      console.log(
        "[Socket.io] Therapist dashboard connected for notifications.",
      );
    });

    socket.on("notification-unread-updated", (response) => {
      if (!response?.success) {
        return;
      }

      setUnreadCount(Number(response.unreadCount) || 0);

      // Refresh the latest notifications shown on the dashboard.
      fetchNotifications();
    });

    socket.on("connect_error", (error) => {
      console.error(
        "[Socket.io] Therapist notification connection failed:",
        error?.message || error,
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "[Socket.io] Therapist notification socket disconnected:",
        reason,
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [SOCKET_URL]);

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
     TODAY PAGINATION
  ========================================================== */

  const todayTotalPages = Math.max(
    1,
    Math.ceil(todaySessions.length / TODAY_SESSIONS_PER_PAGE),
  );

  const safeTodayPage = Math.min(todayPage, todayTotalPages);

  const paginatedTodaySessions = useMemo(() => {
    const startIndex =
      (safeTodayPage - 1) * TODAY_SESSIONS_PER_PAGE;

    return todaySessions.slice(
      startIndex,
      startIndex + TODAY_SESSIONS_PER_PAGE,
    );
  }, [todaySessions, safeTodayPage]);

  const todayPageStart =
    todaySessions.length === 0
      ? 0
      : (safeTodayPage - 1) * TODAY_SESSIONS_PER_PAGE + 1;

  const todayPageEnd = Math.min(
    safeTodayPage * TODAY_SESSIONS_PER_PAGE,
    todaySessions.length,
  );

  /* =========================================================
     UPCOMING SESSIONS
  ========================================================== */

  const upcomingSessions = useMemo(() => {
    return allSessions
      .filter((session) => {
        if (!isActiveSession(session)) {
          return false;
        }

        const endTime = getSessionEndDateTime(session);

        /*
          Keep CONFIRMED and IN_PROGRESS sessions visible
          until their scheduled end time.

          This ensures a session that has already started
          is still shown in Upcoming Sessions so the
          therapist can join or reconnect before the
          meeting window ends.
        */
        return endTime >= currentTime;
      })
      .sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b))
      .slice(0, 4);
  }, [allSessions, currentTime]);

  /* =========================================================
     RECENT CLIENTS
     
     IMPORTANT:
     Recent = latest booking creation time,
     NOT latest session date.
  ========================================================== */

  const recentClients = useMemo(() => {
    return [...clients]
      .map((client) => ({
        ...client,
        latestBookedSession: getLatestBookedSession(client?.sessions),
      }))
      .filter((client) => client?.latestBookedSession)
      .sort((a, b) => {
        return (
          getBookingCreatedTime(b.latestBookedSession) -
          getBookingCreatedTime(a.latestBookedSession)
        );
      })
      .slice(0, 3);
  }, [clients]);

  /* =========================================================
     TODAY'S SESSION COUNT
  ========================================================== */

  const todaysSessionsCount = todaySessions.length;

  /* =========================================================
     CURRENT MONTH REVENUE
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
      <div className="relative min-h-screen overflow-hidden bg-[#f8f9fd] text-slate-900">
        <div className="pointer-events-none fixed -left-40 top-24 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />

        <div className="pointer-events-none fixed -right-40 top-80 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="pointer-events-none fixed bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-200/10 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link to="/therapist/dashboard" className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">Unfazed</p>

                <p className="text-[9px] font-medium tracking-wide text-slate-400">
                  Therapist Dashboard
                </p>
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

  if (error && !clients.length) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8f9fd] text-slate-900">
        <div className="pointer-events-none fixed -left-48 top-32 h-96 w-96 rounded-full bg-violet-200/20 blur-3xl" />

        <div className="pointer-events-none fixed -right-48 top-[38%] h-[30rem] w-[30rem] rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="pointer-events-none fixed bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-200/10 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link to="/therapist/dashboard" className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">Unfazed</p>

                <p className="text-[9px] font-medium tracking-wide text-slate-400">
                  Therapist Dashboard
                </p>
              </div>
            </Link>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-5">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-2xl shadow-slate-200/60">
            <p className="text-sm font-semibold text-slate-800">
              Unable to load dashboard
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
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
        <div className="flex h-[78px] shrink-0 items-center border-b border-slate-100 px-5">
          <Link
            to="/therapist/dashboard"
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

              <p className="text-[10px] text-slate-500">Therapist Portal</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            My Practice
          </p>

          <div className="space-y-1">
            <SidebarLink
              to="/therapist/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active={location.pathname === "/therapist/dashboard"}
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/therapist/schedule"
              icon={<CalendarDays size={18} />}
              label="Schedule"
              active={location.pathname.startsWith("/therapist/schedule")}
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/therapist/clients"
              icon={<Users size={18} />}
              label="Clients"
              active={location.pathname.startsWith("/therapist/clients")}
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/therapist/notes"
              icon={<FileTextIcon />}
              label="Notes"
              active={location.pathname.startsWith("/therapist/notes")}
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/therapist/notifications"
              icon={<Bell size={18} />}
              label="Notifications"
              badge={unreadCount}
              active={location.pathname.startsWith("/therapist/notifications")}
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/therapist/analytics"
              icon={<TrendingUp size={18} />}
              label="Analytics"
              active={location.pathname.startsWith("/therapist/analytics")}
              onClick={() => setSidebarOpen(false)}
            />
          </div>

          <div className="my-5 h-px bg-slate-100" />

          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <SidebarLink
            to="/therapist/profile"
            icon={<UserRound size={18} />}
            label="Profile"
            active={location.pathname.startsWith("/therapist/profile")}
            onClick={() => setSidebarOpen(false)}
          />
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3">
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
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[78px] items-center justify-between px-4 sm:px-7 lg:px-10">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">
                  Therapist Portal
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  Your practice dashboard
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <Link
                to="/therapist/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-violet-600"
                aria-label="Notifications"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-violet-600 px-1 text-[8px] font-bold text-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              <div className="mx-1 hidden h-9 w-px bg-slate-200 sm:block" />

              <Link
                to="/therapist/profile"
                className="group flex items-center gap-2 rounded-2xl border border-transparent py-1.5 pl-1.5 pr-2 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 via-violet-50 to-indigo-100 text-xs font-bold text-violet-700 shadow-sm ring-1 ring-violet-100 transition-transform duration-200 group-hover:scale-105">
                    {therapistInitials}
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-[140px] truncate text-xs font-bold text-slate-900">
                    {therapistName}
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    My Profile
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="hidden text-slate-300 transition group-hover:translate-x-0.5 sm:block"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="relative overflow-hidden bg-slate-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="pointer-events-none absolute left-1/3 top-24 h-64 w-64 rounded-full bg-indigo-100/25 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            {/* Error Banner */}

            {error && (
              <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs font-medium text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Welcome */}

            <section className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/60 to-indigo-50/60 shadow-[0_18px_55px_-25px_rgba(99,102,241,0.25)]">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-200/15 blur-3xl" />

              <div className="relative flex flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 shadow-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <HeartHandshake size={11} />
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">
                      Therapist Portal
                    </span>

                    <span className="h-1 w-1 rounded-full bg-emerald-400" />

                    <span className="text-[9px] font-semibold text-emerald-600">
                      Practice overview
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[40px] lg:leading-[1.1]">
                    {greeting},{" "}
                    <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      {therapistName}
                    </span>
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                    Here’s a quick look at what’s happening with your practice
                    today.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm">
                      <CalendarDays size={12} className="text-violet-500" />

                      <span className="text-[10px] font-semibold text-slate-500">
                        {formatTodayLabel()}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <span className="text-[10px] font-semibold text-slate-500">
                        Your practice at a glance
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/therapist/schedule"
                  className="group inline-flex w-full shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <CalendarDays size={16} />
                  </span>

                  <span>View Schedule</span>

                  <ChevronRight
                    size={15}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </section>

            {/* Stats */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Today's Sessions"
                value={todaysSessionsCount}
                subtitle="Scheduled for today"
                icon={<CalendarDays size={19} />}
              />

              <StatCard
                title="Active Clients"
                value={activeClients}
                subtitle="Clients with active sessions"
                icon={<Users size={19} />}
              />

              <StatCard
                title="Monthly Revenue"
                value={formatCurrency(monthlyRevenue)}
                subtitle="Current month paid revenue"
                icon={<Wallet size={19} />}
              />
            </div>

            {/* Upcoming + Today */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              {/* Upcoming Sessions */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Upcoming Sessions
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Your next scheduled appointments
                    </p>
                  </div>

                  <Link
                    to="/therapist/clients"
                    className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    View All
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  <EmptyState
                    title="No upcoming sessions"
                    description="You currently have no confirmed or pending sessions."
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {upcomingSessions.map((session) => {
                      const joinable = isJoinableSession(session, currentTime);

                      const isJoining = joiningSessionId === session?._id;

                      const status = normalizeStatus(session?.status);

                      return (
                        <SessionRow
                          key={session?._id}
                          name={session.clientName}
                          time={formatTime(session.startTime)}
                          date={formatDate(session.date)}
                          type="Therapy Session"
                          status={getSessionStatusLabel(session.status)}
                          joinable={joinable}
                          joining={isJoining}
                          buttonText={getJoinButtonText(session, currentTime)}
                          onJoin={() => handleJoinSession(session)}
                          isInProgress={status === "IN_PROGRESS"}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Today */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
                    <>
                      <div className="min-h-[420px] space-y-4">
                        {paginatedTodaySessions.map((session) => (
                          <TimelineItem
                            key={session?._id}
                            time={formatTime(session.startTime)}
                            title={session.clientName}
                            status={getSessionStatusLabel(session.status)}
                            active={isCurrentSession(session, currentTime)}
                          />
                        ))}
                      </div>

                      {todayTotalPages > 1 && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[10px] font-medium text-slate-400">
                            Showing {todayPageStart}–{todayPageEnd} of{" "}
                            {todaySessions.length} sessions
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setTodayPage((page) =>
                                  Math.max(page - 1, 1),
                                )
                              }
                              disabled={todayPage === 1}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Previous
                            </button>

                            <span className="min-w-[72px] text-center text-[10px] font-bold text-slate-600">
                              Page {todayPage} of {todayTotalPages}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setTodayPage((page) =>
                                  Math.min(page + 1, todayTotalPages),
                                )
                              }
                              disabled={todayPage === todayTotalPages}
                              className="rounded-xl bg-violet-600 px-3 py-2 text-[10px] font-semibold text-white shadow-sm shadow-violet-100 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            </div>

            {/* Recent Clients */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recent Clients
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Recently booked clients
                  </p>
                </div>

                <Link
                  to="/therapist/clients"
                  className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  View All
                  <ChevronRight size={14} />
                </Link>
              </div>

              {recentClients.length === 0 ? (
                <EmptyState
                  title="No clients yet"
                  description="Clients will appear here after they book sessions with you."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentClients.map((client) => {
                    const latestSession = client?.latestBookedSession;

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

            {/* Practice Overview */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/60">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <TrendingUp size={18} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Practice Overview
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Track revenue and client performance from your analytics
                        dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/therapist/analytics"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:border-violet-200 hover:bg-violet-50"
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

function SidebarLink({ to, icon, label, active = false, badge = 0, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <span className={active ? "text-violet-600" : "text-slate-400"}>
        {icon}
      </span>

      <span className="flex-1">{label}</span>

      {badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-violet-100 hover:shadow-sm">
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
   SESSION ROW
========================================================= */

function SessionRow({
  name,
  time,
  date,
  type,
  status,
  joinable = false,
  joining = false,
  buttonText = "Join Session",
  onJoin,
  isInProgress = false,
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-4 transition hover:bg-violet-50/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
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

      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-700">{time}</p>

          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isInProgress
                ? "bg-violet-50 text-violet-600"
                : getStatusClassName(status)
            }`}
          >
            {status}
          </span>
        </div>

        <button
          type="button"
          onClick={onJoin}
          disabled={!joinable || joining}
          className={`inline-flex min-w-[145px] items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
            joinable
              ? "bg-violet-600 text-white shadow-md shadow-violet-100 hover:bg-violet-700"
              : "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400"
          }`}
        >
          {joining ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Joining...
            </>
          ) : joinable ? (
            <>
              <Video size={14} />
              {buttonText}
            </>
          ) : (
            buttonText
          )}
        </button>
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
        className={`h-3 w-3 shrink-0 rounded-full ${getTimelineDotClassName(
          status,
          active,
        )}`}
      />

      <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50/30 px-3.5 py-3">
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
      className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-violet-50/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
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
