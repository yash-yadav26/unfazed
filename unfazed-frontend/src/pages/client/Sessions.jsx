import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Loader2,
  MapPin,
  Video,
  UserRound,
  XCircle,
} from "lucide-react";

import { getMySessions, joinSession } from "../../api/sessionApi";

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

  /**
   * Stores the session ID currently being joined.
   *
   * This prevents multiple join requests for the same
   * or different sessions at the same time.
   */
  const [joiningSessionId, setJoiningSessionId] = useState(null);

  /**
   * Current time is updated every second.
   *
   * This allows the Join button to automatically become
   * enabled exactly when the session starts.
   */
  const [currentTime, setCurrentTime] = useState(() => new Date());

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
     JOIN SESSION
  ========================================================== */

  const handleJoinSession = async (session) => {
    if (!session?._id) {
      return;
    }

    /**
     * Frontend check is for UX.
     *
     * Backend still performs the actual authorization,
     * participant and time validation.
     */
    if (!isSessionJoinable(session, currentTime)) {
      return;
    }

    try {
      setJoiningSessionId(session._id);
      setError("");

      const response = await joinSession(session._id);

      const result = response?.data;

      /**
       * Backend returns:
       *
       * {
       *   session,
       *   participant,
       *   alreadyJoined
       * }
       */

      const updatedSession = result?.session || session;

      /**
       * Update the local session immediately.
       *
       * This keeps the UI synchronized without requiring
       * a complete page reload.
       */
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

      /**
       * Open the actual video-call page.
       *
       * WebRTC + Socket.io will be handled there.
       */
      navigate(`/client/sessions/${session._id}/video`);
    } catch (err) {
      console.error("Failed to join session:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to join the session. Please try again.",
      );
    } finally {
      setJoiningSessionId(null);
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />

        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <PageHeader />

            <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading your sessions...
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <PageHeader />

          {/* ===================================================
              ERROR
          ==================================================== */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <XCircle size={17} className="mt-0.5 shrink-0 text-red-600" />

                <div>
                  <p className="text-xs font-bold text-red-700">
                    Unable to process session
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              UPCOMING SESSIONS
          ==================================================== */}

          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Upcoming Sessions
              </h2>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-600">
                {sessions.upcoming.length}{" "}
                {sessions.upcoming.length === 1 ? "Upcoming" : "Upcoming"}
              </span>
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
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming sessions"
                description="You don't have any upcoming sessions yet."
              />
            )}
          </section>

          {/* ===================================================
              COMPLETED SESSIONS
          ==================================================== */}

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Completed Sessions
              </h2>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                {sessions.completed.length}
              </span>
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
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No completed sessions"
                description="Your completed sessions will appear here."
              />
            )}
          </section>

          {/* ===================================================
              CANCELLED SESSIONS
          ==================================================== */}

          {sessions.cancelled.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Cancelled Sessions
                </h2>

                <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600">
                  {sessions.cancelled.length}
                </span>
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
                  />
                ))}
              </div>
            </section>
          )}

          {/* ===================================================
              BOOK ANOTHER SESSION
          ==================================================== */}

          <section className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Need another session?
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose a therapist and book your next appointment.
                </p>
              </div>

              <Link
                to="/client/therapists"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
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
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
        My Sessions
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        Your Therapy Sessions
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        View your upcoming and completed therapy sessions.
      </p>
    </div>
  );
}

/* =========================================================
   SESSION CARD
========================================================= */

function SessionCard({ session, type, currentTime, joiningSessionId, onJoin }) {
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

  const joinState = useMemo(() => {
    return getJoinState(session, currentTime);
  }, [session, currentTime]);

  const isJoining = joiningSessionId === session?._id;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* =================================================
            LEFT
        ================================================== */}

        <div className="flex items-start gap-4">
          {/* Icon */}

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isCancelled
                ? "bg-red-50 text-red-600"
                : isCompleted
                  ? "bg-emerald-50 text-emerald-600"
                  : status === SESSION_STATUSES.IN_PROGRESS
                    ? "bg-amber-50 text-amber-600"
                    : "bg-violet-50 text-violet-600"
            }`}
          >
            {isCancelled ? (
              <XCircle size={20} />
            ) : isCompleted ? (
              <CheckCircle2 size={20} />
            ) : (
              <CalendarDays size={20} />
            )}
          </div>

          {/* Session Information */}

          <div className="min-w-0">
            {/* Title + Status */}

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Individual Therapy
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  isCancelled
                    ? "bg-red-50 text-red-600"
                    : isCompleted
                      ? "bg-emerald-50 text-emerald-600"
                      : status === SESSION_STATUSES.IN_PROGRESS
                        ? "bg-amber-50 text-amber-600"
                        : "bg-violet-50 text-violet-600"
                }`}
              >
                {formatStatus(status)}
              </span>
            </div>

            {/* Details */}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              {/* Therapist */}

              <span className="flex items-center gap-1.5">
                <UserRound size={13} />
                {therapistName}
              </span>

              {/* Date */}

              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {formatDate(session?.date)}
              </span>

              {/* Time */}

              <span className="flex items-center gap-1.5">
                <Clock3 size={13} />
                {formatTime(session?.startTime)}
              </span>

              {/* Duration */}

              {duration !== null && duration !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Clock3 size={13} />
                  {duration} min
                </span>
              )}

              {/* Mode */}

              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                Online
              </span>
            </div>

            {/* Payment Status */}

            {session?.paymentStatus && (
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${
                    session.paymentStatus === "PAID"
                      ? "bg-emerald-50 text-emerald-600"
                      : session.paymentStatus === "FAILED"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {session.paymentStatus === "PAID" ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <Clock3 size={11} />
                  )}
                  Payment: {formatStatus(session.paymentStatus)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================== */}

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:shrink-0">
          {/* ------------------------ UPCOMING ------------------------ */}

          {isUpcoming && (
            <>
              {status === SESSION_STATUSES.IN_PROGRESS ? (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-600">
                  <Video size={14} />
                  Session In Progress
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 size={14} />
                  Confirmed
                </div>
              )}

              {/* Join Button */}

              {joinState.canJoin && (
                <button
                  type="button"
                  onClick={() => onJoin(session)}
                  disabled={isJoining}
                  className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isJoining ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video size={14} />
                      Join Session
                    </>
                  )}
                </button>
              )}

              {/* Future Session */}

              {joinState.state === "NOT_STARTED" && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="text-[10px] font-semibold text-slate-500">
                    Starts at {formatTime(session?.startTime)}
                  </p>
                </div>
              )}

              {/* Session Ended / Waiting */}

              {joinState.state === "ENDED" && (
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                  <p className="text-[10px] font-semibold text-slate-500">
                    Session window ended
                  </p>
                </div>
              )}
            </>
          )}

          {/* ----------------------- COMPLETED ----------------------- */}

          {isCompleted && (
            <span className="text-xs text-slate-400">Session completed</span>
          )}

          {/* ----------------------- CANCELLED ----------------------- */}

          {isCancelled && (
            <span className="text-xs text-red-400">Session cancelled</span>
          )}
        </div>
      </div>
    </div>
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

  /**
   * Join is meaningful only for confirmed/in-progress
   * sessions.
   */
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

  /**
   * Invalid date/time configuration.
   */
  if (!startDateTime || !endDateTime) {
    return {
      canJoin: false,
      state: "UNAVAILABLE",
    };
  }

  const currentTimestamp = currentTime.getTime();

  const startTimestamp = startDateTime.getTime();

  const endTimestamp = endDateTime.getTime();

  /* -------------------------- Before Start ------------------------- */

  if (currentTimestamp < startTimestamp) {
    return {
      canJoin: false,
      state: "NOT_STARTED",
    };
  }

  /* ---------------------------- Ended ----------------------------- */

  if (currentTimestamp >= endTimestamp) {
    return {
      canJoin: false,
      state: "ENDED",
    };
  }

  /* -------------------------- Join Allowed ------------------------- */

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

  /**
   * Session dates are stored as UTC midnight,
   * but the selected session time is an Indian local
   * clock time.
   *
   * For frontend display/join button purposes,
   * we construct the local browser date using the
   * same YYYY-MM-DD + HH:mm values.
   */
  const dateTime = new Date(`${normalizedDate}T00:00:00`);

  dateTime.setHours(hours, minutes, 0, 0);

  return dateTime;
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Clock3 size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">{title}</h3>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/client" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
            <HeartHandshake size={19} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight">Unfazed</p>

            <p className="text-[9px] text-slate-500">Client Portal</p>
          </div>
        </Link>

        <Link
          to="/client"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
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
    month: "long",
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
