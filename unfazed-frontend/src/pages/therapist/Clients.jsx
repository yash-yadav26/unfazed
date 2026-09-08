import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  XCircle,
} from "lucide-react";

import { getMyClients } from "../../api/clientApi";
import { getUnreadMessagesCount } from "../../api/chatApi";

import {
  requestNotificationPermission,
  showBrowserNotification,
} from "../../utils/browserNotification";

/* =========================================================
   CONSTANTS
========================================================= */

const CHAT_ALLOWED_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Clients() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================== */

  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Stores unread count by client profile ID.
   *
   * Example:
   *
   * {
   *   "clientId1": 2,
   *   "clientId2": 5
   * }
   */
  const [unreadCounts, setUnreadCounts] = useState({});

  /* =========================================================
     REQUEST BROWSER NOTIFICATION PERMISSION
  ========================================================== */

  useEffect(() => {
    requestNotificationPermission().catch((error) => {
      console.error(
        "Failed to request browser notification permission:",
        error,
      );
    });
  }, []);

  /* =========================================================
     FETCH THERAPIST CLIENTS
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyClients();

        if (!isMounted) {
          return;
        }

        const clientData = Array.isArray(response?.data) ? response.data : [];

        setClients(clientData);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to fetch clients:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load clients. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     FETCH INITIAL UNREAD COUNTS
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCounts = async () => {
      try {
        const response = await getUnreadMessagesCount();

        if (!isMounted) {
          return;
        }

        const data = response?.data || {};

        const conversations = Array.isArray(data.conversations)
          ? data.conversations
          : [];

        const unreadMap = {};

        conversations.forEach((conversation) => {
          if (!conversation?.userId) {
            return;
          }

          /*
           * Backend returns the sender's
           * CLIENT/THERAPIST profile ID.
           */
          unreadMap[String(conversation.userId)] =
            Number(conversation.unreadCount) || 0;
        });

        setUnreadCounts(unreadMap);
      } catch (err) {
        /*
         * Unread count should never break
         * the Clients page.
         */
        console.error("Failed to fetch unread message counts:", err);
      }
    };

    loadUnreadCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     REAL-TIME CHAT UNREAD + BROWSER NOTIFICATION
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
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Clients page connected for chat notifications.");
    });

    socket.on("chat-unread-updated", (response) => {
      if (!response?.success || !response?.userId) {
        return;
      }

      /*
       * userId is the sender's CLIENT profile ID.
       */
      const participantId = String(response.userId);

      const unreadCount = Number(response.unreadCount) || 0;

      /* ---------------------------------------------------- */
      /*                  Update Chat Badge                   */
      /* ---------------------------------------------------- */

      setUnreadCounts((previous) => ({
        ...previous,
        [participantId]: unreadCount,
      }));

      /* ---------------------------------------------------- */
      /*               Browser Notification                   */
      /* ---------------------------------------------------- */

      if (unreadCount > 0) {
        showBrowserNotification({
          title: "New message from your client",
          body:
            unreadCount === 1
              ? "You have 1 unread message."
              : `You have ${unreadCount} unread messages.`,
        });
      }
    });

    socket.on("connect_error", (err) => {
      console.error(
        "[Socket.io] Clients unread notification connection failed:",
        err?.message || err,
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "[Socket.io] Clients unread notification socket disconnected:",
        reason,
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  /* =========================================================
     FILTER + SORT
  ========================================================== */

  const filteredClients = useMemo(() => {
    const searchValue = String(search || "")
      .trim()
      .toLowerCase();

    const filtered = clients.filter((client) => {
      const name = String(client?.name || "").toLowerCase();

      const email = String(client?.email || "").toLowerCase();

      const phone = String(client?.phone || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      }

      if (sortBy === "sessions") {
        return Number(b?.sessionsCount || 0) - Number(a?.sessionsCount || 0);
      }

      return 0;
    });
  }, [clients, search, sortBy]);

  /* =========================================================
     TOTAL CLIENTS
  ========================================================== */

  const totalClients = clients.length;

  const totalSessions = useMemo(() => {
    return clients.reduce(
      (total, client) => total + Number(client?.sessionsCount || 0),
      0,
    );
  }, [clients]);

  const chatEnabledClients = useMemo(() => {
    return clients.filter((client) => hasChatEligibleSession(client?.sessions))
      .length;
  }, [clients]);

  /* =========================================================
     OPEN CHAT
  ========================================================== */

  const handleOpenChat = (client) => {
    if (!client?._id) {
      return;
    }

    /*
     * Frontend only allows opening the chat button
     * for clients with a valid session.
     *
     * Backend performs the real authorization again.
     */
    if (!hasChatEligibleSession(client?.sessions)) {
      return;
    }

    navigate(`/therapist/clients/${client._id}/chat`);
  };

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo */}

          <Link
            to="/therapist/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-200/70 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-2xl">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-950">
                Unfazed
              </p>

              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
                Therapist Dashboard
              </p>
            </div>
          </Link>

          {/* Back */}

          <Link
            to="/therapist/dashboard"
            className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-bold text-slate-500 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="pointer-events-none fixed -left-36 top-20 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-28 h-[420px] w-[420px] rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-[35%] h-80 w-80 rounded-full bg-fuchsia-100/20 blur-3xl" />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
        {/* Background Decoration */}

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* ===================================================
              PAGE HEADING
          ==================================================== */}

          <section>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                  <Users size={13} className="text-violet-600" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
                    Client CRM
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[42px]">
                  Your Clients
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Manage your clients, review booked sessions, and continue
                  conversations securely.
                </p>
              </div>

              {/* Summary */}

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <SummaryCard value={totalClients} label="Clients" />

                <SummaryCard value={totalSessions} label="Sessions" />

                <SummaryCard value={chatEnabledClients} label="Chat" />
              </div>
            </div>
          </section>

          {/* ===================================================
              CLIENT TABLE
          ==================================================== */}

          <section className="mt-8 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur-sm">
            {/* =================================================
                TOOLBAR
            ================================================== */}

            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/15 to-indigo-50/20 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {/* Search */}

                <div className="relative w-full xl:max-w-xl">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, email or phone..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-violet-200 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {/* Sort */}

                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-slate-400" />

                  <span className="text-xs font-semibold text-slate-500">
                    Sort
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm outline-none transition duration-200 hover:border-violet-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="name">Sort by Name</option>

                    <option value="sessions">Sort by Sessions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="px-5 py-24 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading your clients...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching your client records
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================== */}

            {!loading && error && (
              <div className="px-5 py-24 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                  <XCircle size={24} className="text-red-500" />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-700">
                  Unable to load clients
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-red-500">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                TABLE
            ================================================== */}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px]">
                  <colgroup>
                    <col className="w-[27%]" />
                    <col className="w-[51%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-violet-50/25">
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Client
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Booked Sessions
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Total
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((client) => {
                      const canChat = hasChatEligibleSession(client?.sessions);

                      const unreadCount =
                        Number(unreadCounts[String(client?._id)]) || 0;

                      return (
                        <tr
                          key={client?._id}
                          className="group transition duration-200 hover:bg-violet-50/35"
                        >
                          {/* =================================================
                                CLIENT
                            ================================================== */}

                          <td className="px-6 py-6 align-top">
                            <div className="flex items-start gap-3.5">
                              {/* Avatar */}

                              <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-100 via-white to-indigo-100 text-sm font-extrabold text-violet-700 shadow-sm ring-1 ring-violet-100 transition duration-200 group-hover:scale-[1.03]">
                                {getInitials(client?.name || "Client")}

                                {canChat && (
                                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                                )}
                              </div>

                              {/* Details */}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {client?.name || "Unknown Client"}
                                </p>

                                <p className="mt-1 break-all text-xs text-slate-400">
                                  {client?.email || "Email not available"}
                                </p>

                                {client?.phone && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    {client.phone}
                                  </p>
                                )}

                                {client?.age && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    Age: {client.age}
                                  </p>
                                )}

                                {canChat && (
                                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700 shadow-sm">
                                    <MessageCircle size={10} />
                                    Chat available
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* =================================================
                                BOOKED SESSIONS
                            ================================================== */}

                          <td className="px-5 py-6 align-top">
                            {Array.isArray(client?.sessions) &&
                            client.sessions.length > 0 ? (
                              <div className="space-y-2.5">
                                {[...client.sessions]
                                  .sort((a, b) => {
                                    const dateA = new Date(a?.date || 0);
                                    const dateB = new Date(b?.date || 0);

                                    const dateDifference =
                                      dateA.getTime() - dateB.getTime();

                                    if (dateDifference !== 0) {
                                      return dateDifference;
                                    }

                                    const timeA = String(a?.startTime || "");
                                    const timeB = String(b?.startTime || "");

                                    return timeA.localeCompare(timeB);
                                  })
                                  .map((session, index) => (
                                    <SessionCard
                                      key={session?._id || index}
                                      session={session}
                                      index={index}
                                    />
                                  ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No session data
                              </span>
                            )}
                          </td>

                          {/* =================================================
                                TOTAL SESSIONS
                            ================================================== */}

                          <td className="px-5 py-6 align-top">
                            <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-3.5 py-2.5 shadow-sm">
                              <span className="text-sm font-bold text-violet-700">
                                {client?.sessionsCount || 0}
                              </span>

                              <span className="text-[10px] font-semibold text-violet-600">
                                {client?.sessionsCount === 1
                                  ? "session"
                                  : "sessions"}
                              </span>
                            </div>
                          </td>

                          {/* =================================================
                                CHAT
                            ================================================== */}

                          <td className="px-5 py-6 align-top">
                            <button
                              type="button"
                              onClick={() => handleOpenChat(client)}
                              disabled={!canChat}
                              className={`relative inline-flex h-11 w-full min-w-[112px] items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold shadow-sm transition duration-200 ${
                                canChat
                                  ? "border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                                  : "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300 shadow-none"
                              }`}
                            >
                              <MessageCircle size={14} />
                              Chat
                              {canChat && unreadCount > 0 && (
                                <UnreadBadge count={unreadCount} />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* =================================================
                    EMPTY STATE
                ================================================== */}

                {filteredClients.length === 0 && (
                  <div className="px-5 py-24 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 shadow-sm ring-8 ring-violet-50">
                      <Users size={24} />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-700">
                      No clients found
                    </p>

                    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                      {search
                        ? "Try a different name, email or phone number."
                        : "No clients have booked a session with you yet."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ===================================================
              PRIVACY
          ==================================================== */}

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
            <ShieldCheck size={13} className="text-emerald-500" />
            Client information and conversations are private and securely
            handled.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   UNREAD BADGE
========================================================= */

function UnreadBadge({ count }) {
  const displayCount = count > 99 ? "99+" : count;

  return (
    <span className="absolute -right-1.5 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-rose-500 to-red-500 px-1.5 text-[9px] font-extrabold leading-none text-white shadow-md shadow-red-200">
      {displayCount}
    </span>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ value, label }) {
  return (
    <div className="group min-w-[82px] rounded-[20px] border border-slate-200/80 bg-white/90 px-3 py-3.5 text-center shadow-[0_16px_45px_-30px_rgba(15,23,42,0.28)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_22px_50px_-28px_rgba(99,102,241,0.25)] sm:min-w-[100px] sm:px-4">
      <p className="text-xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SESSION CARD
========================================================= */

function SessionCard({ session, index }) {
  const status = String(session?.status || "").toUpperCase();

  const isInProgress = status === "IN_PROGRESS";

  const isCompleted = status === "COMPLETED";

  const isCancelled = status === "CANCELLED";

  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 ${
        isCompleted
          ? "border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-white"
          : isCancelled
            ? "border-red-100 bg-gradient-to-r from-red-50/70 to-white"
            : isInProgress
              ? "border-amber-100 bg-gradient-to-r from-amber-50/70 to-white"
              : "border-slate-100 bg-gradient-to-r from-slate-50/80 to-white hover:border-violet-100 hover:bg-violet-50/30"
      }`}
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
            <CalendarDays
              size={13}
              className={
                isCompleted
                  ? "text-emerald-600"
                  : isCancelled
                    ? "text-red-500"
                    : "text-violet-500"
              }
            />
          </div>

          <span className="text-[10px] font-bold text-slate-700">
            Session {index + 1}
          </span>
        </div>

        <SessionStatus status={status} />
      </div>

      {/* Date */}

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <CalendarDays size={12} />

          <span>{formatSessionDate(session?.date)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Clock3 size={12} />

          <span>
            {session?.startTime || "--:--"}
            {" - "}
            {session?.endTime || "--:--"}
          </span>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-[10px] text-slate-400">
          Duration: {session?.duration ?? 0} min
        </span>

        <span className="text-[10px] text-slate-400">
          Payment: {formatStatus(session?.paymentStatus)}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SESSION STATUS
========================================================= */

function SessionStatus({ status }) {
  const normalizedStatus = String(status || "").toUpperCase();

  let className = "border border-slate-200 bg-slate-100 text-slate-500";

  let icon = null;

  if (normalizedStatus === "CONFIRMED") {
    className = "border border-emerald-100 bg-emerald-50 text-emerald-700";

    icon = <CheckCircle2 size={10} />;
  } else if (normalizedStatus === "PENDING") {
    className = "border border-amber-100 bg-amber-50 text-amber-700";

    icon = <Clock3 size={10} />;
  } else if (normalizedStatus === "IN_PROGRESS") {
    className = "border border-amber-100 bg-amber-50 text-amber-800";

    icon = <Clock3 size={10} />;
  } else if (normalizedStatus === "COMPLETED") {
    className = "border border-violet-100 bg-violet-50 text-violet-700";

    icon = <CheckCircle2 size={10} />;
  } else if (normalizedStatus === "CANCELLED") {
    className = "border border-red-100 bg-red-50 text-red-700";

    icon = <XCircle size={10} />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[9px] font-bold shadow-sm ${className}`}
    >
      {icon}

      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   CHAT ELIGIBILITY
========================================================= */

function hasChatEligibleSession(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return false;
  }

  return sessions.some((session) => {
    const status = String(session?.status || "").toUpperCase();

    return CHAT_ALLOWED_STATUSES.includes(status);
  });
}

/* =========================================================
   FORMAT SESSION DATE
========================================================= */

function formatSessionDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(value) {
  if (!value) {
    return "N/A";
  }

  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   EXPORT
========================================================= */

export default Clients;
