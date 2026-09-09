import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Video,
  UserRound,
  XCircle,
} from "lucide-react";

import { getMySessions, joinSession } from "../../api/sessionApi";

import { getUnreadMessagesCount } from "../../api/chatApi";

import {
  requestNotificationPermission,
  showBrowserNotification,
} from "../../utils/browserNotification";

/* =========================================================
   CONSTANTS
========================================================= */

const SESSION_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Sessions() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================== */

  const [sessions, setSessions] = useState({
    upcoming: [],
    completed: [],
    cancelled: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [joiningSessionId, setJoiningSessionId] = useState(null);

  const [currentTime, setCurrentTime] = useState(() => new Date());

  /*
   * Stores unread count by therapist profile ID.
   *
   * Example:
   *
   * {
   *   "therapistId1": 2,
   *   "therapistId2": 5
   * }
   */
  const [unreadCounts, setUnreadCounts] = useState({});

  /* =========================================================
     CURRENT TIME CLOCK
  ========================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

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
     FETCH MY SESSIONS
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMySessions();

        if (!isMounted) {
          return;
        }

        const data = response?.data || {};

        setSessions({
          upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],

          completed: Array.isArray(data.completed) ? data.completed : [],

          cancelled: Array.isArray(data.cancelled) ? data.cancelled : [],
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to fetch my sessions:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load your sessions. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSessions();

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

          unreadMap[String(conversation.userId)] =
            Number(conversation.unreadCount) || 0;
        });

        setUnreadCounts(unreadMap);
      } catch (err) {
        /*
         * Unread count should never break
         * the Sessions page.
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
      console.log(
        "[Socket.io] Sessions page connected for chat notifications.",
      );
    });

    socket.on("chat-unread-updated", (response) => {
      if (!response?.success || !response?.userId) {
        return;
      }

      /*
       * userId here is the sender's CLIENT/THERAPIST
       * profile ID, not the authenticated User ID.
       */
      const participantId = String(response.userId);

      const unreadCount = Number(response.unreadCount) || 0;

      /* ------------------------------------------------------ */
      /*                    Update Chat Badge                    */
      /* ------------------------------------------------------ */

      setUnreadCounts((previous) => ({
        ...previous,
        [participantId]: unreadCount,
      }));

      /* ------------------------------------------------------ */
      /*                Browser Notification                     */
      /* ------------------------------------------------------ */

      if (unreadCount > 0) {
        showBrowserNotification({
          title: "New message from your therapist",
          body:
            unreadCount === 1
              ? "You have 1 unread message."
              : `You have ${unreadCount} unread messages.`,
        });
      }
    });

    socket.on("connect_error", (err) => {
      console.error(
        "[Socket.io] Sessions unread notification connection failed:",
        err?.message || err,
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "[Socket.io] Sessions unread notification socket disconnected:",
        reason,
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  /* =========================================================
     JOIN SESSION
  ========================================================== */

  const handleJoinSession = async (session) => {
    if (!session?._id) {
      return;
    }

    if (!isSessionJoinable(session, currentTime)) {
      return;
    }

    try {
      setJoiningSessionId(session._id);
      setError("");

      const response = await joinSession(session._id);

      const result = response?.data;

      const updatedSession = result?.session || session;

      setSessions((previous) => ({
        ...previous,

        upcoming: previous.upcoming.map((item) =>
          item._id === updatedSession?._id ? updatedSession : item,
        ),

        completed: previous.completed.map((item) =>
          item._id === updatedSession?._id ? updatedSession : item,
        ),

        cancelled: previous.cancelled.map((item) =>
          item._id === updatedSession?._id ? updatedSession : item,
        ),
      }));

      navigate(`/client/sessions/${session._id}/video`);
    } catch (err) {
      console.error("Failed to join session:", err);

      const errorMessage =
        err?.response?.data?.message ||
        "Unable to join the session. Please try again.";

      setError(errorMessage);

      toast.error(errorMessage, {
        id: "join-session-error",
      });
    } finally {
      setJoiningSessionId(null);
    }
  };

  /* =========================================================
     OPEN CHAT
  ========================================================== */

  const handleOpenChat = (session) => {
    if (!session?._id) {
      return;
    }

    const status = String(session.status || "").toUpperCase();

    if (
      status !== SESSION_STATUSES.CONFIRMED &&
      status !== SESSION_STATUSES.IN_PROGRESS &&
      status !== SESSION_STATUSES.COMPLETED
    ) {
      return;
    }

    navigate(`/client/sessions/${session._id}/chat`);
  };

  /* =========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        <Header />

        <main className="px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <PageHeader />

            <div className="mt-8 flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <Loader2 size={26} className="animate-spin text-violet-600" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading your sessions...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Preparing your therapy schedule
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <Header />

      <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
        {/* Background Decorations */}

        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <PageHeader />

          {/* ===================================================
              ERROR
          ==================================================== */}

          {error && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
              <div className="flex items-start gap-3 border-l-4 border-red-500 px-5 py-4">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Unable to process your request
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-500">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              UPCOMING SESSIONS
          ==================================================== */}

          <section className="mt-9">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5">
                  <Sparkles size={12} className="text-violet-600" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
                    Your schedule
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Upcoming Sessions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your confirmed therapy appointments.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-100 bg-white px-3.5 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 text-[10px] font-bold text-violet-600">
                  {sessions.upcoming.length}
                </span>

                <span className="text-xs font-semibold text-slate-600">
                  Upcoming
                </span>
              </div>
            </div>

            {sessions.upcoming.length > 0 ? (
              <div className="space-y-4">
                {sessions.upcoming.map((session) => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    type="upcoming"
                    currentTime={currentTime}
                    joiningSessionId={joiningSessionId}
                    onJoin={handleJoinSession}
                    onChat={handleOpenChat}
                    unreadCount={getSessionUnreadCount(session, unreadCounts)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming sessions"
                description="You don't have any upcoming therapy sessions yet."
              />
            )}
          </section>

          {/* ===================================================
              COMPLETED SESSIONS
          ==================================================== */}

          <section className="mt-12">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                  Session history
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  Completed Sessions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Keep access to your previous therapy conversations.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white px-3.5 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600">
                  {sessions.completed.length}
                </span>

                <span className="text-xs font-semibold text-slate-600">
                  Completed
                </span>
              </div>
            </div>

            {sessions.completed.length > 0 ? (
              <div className="space-y-4">
                {sessions.completed.map((session) => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    type="completed"
                    currentTime={currentTime}
                    joiningSessionId={joiningSessionId}
                    onJoin={handleJoinSession}
                    onChat={handleOpenChat}
                    unreadCount={getSessionUnreadCount(session, unreadCounts)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No completed sessions"
                description="Your completed therapy sessions will appear here."
              />
            )}
          </section>

          {/* ===================================================
              CANCELLED SESSIONS
          ==================================================== */}

          {sessions.cancelled.length > 0 && (
            <section className="mt-12">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-500">
                  Session history
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  Cancelled Sessions
                </h2>
              </div>

              <div className="space-y-4">
                {sessions.cancelled.map((session) => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    type="cancelled"
                    currentTime={currentTime}
                    joiningSessionId={joiningSessionId}
                    onJoin={handleJoinSession}
                    onChat={handleOpenChat}
                    unreadCount={getSessionUnreadCount(session, unreadCounts)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ===================================================
              BOOK ANOTHER SESSION
          ==================================================== */}

          <section className="relative mt-12 overflow-hidden rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 p-6 text-white shadow-[0_25px_70px_-35px_rgba(109,40,217,0.65)] sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  <HeartHandshake size={13} />

                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    Continue your journey
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Ready for another session?
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-6 text-violet-100">
                  Find a therapist, choose a time that works for you, and book
                  your next appointment.
                </p>
              </div>

              <Link
                to="/client/therapists"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                <CalendarDays size={15} />
                Book Session
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader() {
  return (
    <section className="relative">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
              <CalendarDays size={16} className="text-violet-600" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-600">
              My Sessions
            </p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your Therapy Sessions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your upcoming appointments, join active sessions, and stay
            connected with your therapist.
          </p>
        </div>

        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <ShieldCheck size={19} className="text-emerald-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                Private & Secure
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Your sessions stay confidential
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SESSION CARD
========================================================= */

function SessionCard({
  session,
  type,
  currentTime,
  joiningSessionId,
  onJoin,
  onChat,
  unreadCount = 0,
}) {
  const therapist =
    session?.therapistId && typeof session.therapistId === "object"
      ? session.therapistId
      : null;

  const therapistName =
    therapist?.name || session?.therapistName || "Therapist";

  const status = String(
    session?.status || SESSION_STATUSES.PENDING,
  ).toUpperCase();

  const duration = session?.duration ?? null;

  const isUpcoming = type === "upcoming";

  const isCompleted = type === "completed";

  const isCancelled = type === "cancelled";

  const canChat =
    status === SESSION_STATUSES.CONFIRMED ||
    status === SESSION_STATUSES.IN_PROGRESS ||
    status === SESSION_STATUSES.COMPLETED;

  const joinState = useMemo(() => {
    return getJoinState(session, currentTime);
  }, [session, currentTime]);

  const isJoining = joiningSessionId === session?._id;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-white shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] transition duration-300 ${
        isCancelled
          ? "border-red-100"
          : isCompleted
            ? "border-emerald-100"
            : status === SESSION_STATUSES.IN_PROGRESS
              ? "border-amber-200"
              : "border-slate-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_22px_60px_-35px_rgba(109,40,217,0.28)]"
      }`}
    >
      {/* Top accent */}

      {!isCancelled && (
        <div
          className={`h-1 w-full ${
            isCompleted
              ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
              : status === SESSION_STATUSES.IN_PROGRESS
                ? "bg-gradient-to-r from-amber-400 to-orange-300"
                : "bg-gradient-to-r from-violet-500 via-violet-500 to-indigo-500"
          }`}
        />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* LEFT CONTENT */}

          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                isCancelled
                  ? "bg-red-50 text-red-500"
                  : isCompleted
                    ? "bg-emerald-50 text-emerald-600"
                    : status === SESSION_STATUSES.IN_PROGRESS
                      ? "bg-amber-50 text-amber-600"
                      : "bg-violet-50 text-violet-600"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={23} />
              ) : isCancelled ? (
                <XCircle size={23} />
              ) : (
                <CalendarDays size={23} />
              )}

              {status === SESSION_STATUSES.IN_PROGRESS && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-slate-950">
                  Individual Therapy
                </h3>

                <StatusBadge status={status} />
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                  <UserRound size={13} className="text-slate-500" />
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  {therapistName}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <InfoPill
                  icon={<CalendarDays size={13} />}
                  label={formatDate(session?.date)}
                />

                <InfoPill
                  icon={<Clock3 size={13} />}
                  label={formatTime(session?.startTime)}
                />

                {duration !== null && duration !== undefined && (
                  <InfoPill
                    icon={<Clock3 size={13} />}
                    label={`${duration} min`}
                  />
                )}

                <InfoPill icon={<Video size={13} />} label="Online" />
              </div>

              {session?.paymentStatus && (
                <div className="mt-3">
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 ${
                      session.paymentStatus === "PAID"
                        ? "bg-emerald-50"
                        : session.paymentStatus === "FAILED"
                          ? "bg-red-50"
                          : "bg-amber-50"
                    }`}
                  >
                    {session.paymentStatus === "PAID" ? (
                      <CheckCircle2 size={12} className="text-emerald-600" />
                    ) : (
                      <Clock3
                        size={12}
                        className={
                          session.paymentStatus === "FAILED"
                            ? "text-red-500"
                            : "text-amber-500"
                        }
                      />
                    )}

                    <span
                      className={`text-[10px] font-bold ${
                        session.paymentStatus === "PAID"
                          ? "text-emerald-600"
                          : session.paymentStatus === "FAILED"
                            ? "text-red-500"
                            : "text-amber-600"
                      }`}
                    >
                      Payment: {formatStatus(session.paymentStatus)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT ACTIONS */}

          <div className="flex w-full flex-col gap-2 xl:w-auto xl:min-w-[330px]">
            {isUpcoming && (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    {status === SESSION_STATUSES.IN_PROGRESS ? (
                      <>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                          <Video size={14} className="text-amber-600" />
                        </span>

                        <div>
                          <p className="text-[10px] font-bold text-amber-700">
                            Session in progress
                          </p>

                          <p className="text-[10px] text-slate-400">
                            You can join now
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                          <CheckCircle2
                            size={14}
                            className="text-emerald-600"
                          />
                        </span>

                        <div>
                          <p className="text-[10px] font-bold text-emerald-700">
                            Session confirmed
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Your booking is confirmed
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {canChat && (
                    <button
                      type="button"
                      onClick={() => onChat(session)}
                      className="group/button relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-xs font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
                    >
                      <MessageCircle
                        size={15}
                        className="transition-transform group-hover/button:scale-110"
                      />
                      Chat
                      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
                    </button>
                  )}

                  {joinState.canJoin ? (
                    <button
                      type="button"
                      onClick={() => onJoin(session)}
                      disabled={isJoining}
                      className="group/button inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isJoining ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Video
                            size={15}
                            className="transition-transform group-hover/button:scale-110"
                          />
                          Join Session
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {joinState.state === "NOT_STARTED"
                          ? `Starts at ${formatTime(session?.startTime)}`
                          : joinState.state === "ENDED"
                            ? "Session window ended"
                            : "Not available"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {isCompleted && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-emerald-700">
                      Session completed
                    </p>

                    <p className="text-[10px] text-emerald-600/70">
                      Your session has ended
                    </p>
                  </div>
                </div>

                {canChat && (
                  <button
                    type="button"
                    onClick={() => onChat(session)}
                    className="group/button relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                  >
                    <MessageCircle size={15} />
                    Continue Chat
                    {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
                  </button>
                )}
              </div>
            )}

            {isCancelled && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                  <XCircle size={14} className="text-red-500" />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-red-600">
                    Session cancelled
                  </p>

                  <p className="text-[10px] text-red-500/70">
                    This appointment is no longer active
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   UNREAD BADGE
========================================================= */

function UnreadBadge({ count }) {
  const displayCount = count > 99 ? "99+" : count;

  return (
    <span className="absolute -right-1 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[9px] font-bold leading-none text-white shadow-sm">
      {displayCount}
    </span>
  );
}

/* =========================================================
   GET SESSION UNREAD COUNT
========================================================= */

function getSessionUnreadCount(session, unreadCounts) {
  const therapistId =
    session?.therapistId && typeof session.therapistId === "object"
      ? session.therapistId?._id
      : session?.therapistId;

  if (!therapistId) {
    return 0;
  }

  return Number(unreadCounts[String(therapistId)]) || 0;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const statusStyles = {
    CONFIRMED: "bg-violet-50 text-violet-700 border-violet-100",

    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-100",

    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",

    CANCELLED: "bg-red-50 text-red-600 border-red-100",

    PENDING: "bg-slate-100 text-slate-600 border-slate-200",

    NO_SHOW: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${
        statusStyles[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   INFO PILL
========================================================= */

function InfoPill({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500">
      {icon}
      {label}
    </span>
  );
}

/* =========================================================
   JOIN STATE
========================================================= */

function getJoinState(session, currentTime) {
  if (!session) {
    return {
      canJoin: false,
      state: "UNAVAILABLE",
    };
  }

  const status = String(session.status || "").toUpperCase();

  if (
    status !== SESSION_STATUSES.CONFIRMED &&
    status !== SESSION_STATUSES.IN_PROGRESS
  ) {
    return {
      canJoin: false,
      state: "UNAVAILABLE",
    };
  }

  const startDateTime = getSessionDateTime(session, session.startTime);

  const endDateTime = getSessionDateTime(session, session.endTime);

  if (!startDateTime || !endDateTime) {
    return {
      canJoin: false,
      state: "UNAVAILABLE",
    };
  }

  const currentTimestamp = currentTime.getTime();

  const startTimestamp = startDateTime.getTime();

  const endTimestamp = endDateTime.getTime();

  if (currentTimestamp < startTimestamp) {
    return {
      canJoin: false,
      state: "NOT_STARTED",
    };
  }

  if (currentTimestamp >= endTimestamp) {
    return {
      canJoin: false,
      state: "ENDED",
    };
  }

  return {
    canJoin: true,
    state: "AVAILABLE",
  };
}

function isSessionJoinable(session, currentTime) {
  return getJoinState(session, currentTime).canJoin;
}

/* =========================================================
   SESSION DATE + TIME
========================================================= */

function getSessionDateTime(session, timeValue) {
  if (!session?.date || !timeValue) {
    return null;
  }

  const normalizedDate = normalizeDate(session.date);

  const [hours, minutes] = String(timeValue).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const dateTime = new Date(`${normalizedDate}T00:00:00`);

  dateTime.setHours(hours, minutes, 0, 0);

  return dateTime;
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ title, description }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-violet-100/40 blur-3xl" />

      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <CalendarDays size={24} />
        </div>

        <h3 className="mt-5 text-base font-bold text-slate-800">{title}</h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/client" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200 transition group-hover:scale-105">
            <HeartHandshake size={19} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-950">
              Unfazed
            </p>

            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Client Portal
            </p>
          </div>
        </Link>

        <Link
          to="/client"
          className="group inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-violet-600"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-0.5"
          />

          <span>Back to Dashboard</span>
        </Link>
      </div>
    </header>
  );
}

/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {
  if (!status) {
    return "";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   NORMALIZE DATE
========================================================= */

function normalizeDate(date) {
  if (!date) {
    return "";
  }

  return String(date).slice(0, 10);
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const normalized = normalizeDate(dateValue);

  const parsedDate = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(timeValue) {
  if (!timeValue) {
    return "—";
  }

  const [hours, minutes] = String(timeValue).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return String(timeValue);
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* =========================================================
   EXPORT
========================================================= */

export default Sessions;
