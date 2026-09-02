import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  UserRound,
  XCircle,
} from "lucide-react";

import { getMySessions } from "../../api/sessionApi";

function Sessions() {
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

  /* =========================================================
     FETCH MY SESSIONS
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchSessions = async () => {
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

    fetchSessions();

    return () => {
      isMounted = false;
    };
  }, []);

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
                    Unable to load sessions
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

function SessionCard({ session, type }) {
  const therapist =
    session?.therapistId && typeof session.therapistId === "object"
      ? session.therapistId
      : null;

  const therapistName =
    therapist?.name || session?.therapistName || "Therapist";

  const status = session?.status || "PENDING";

  const duration = session?.duration ?? null;

  const isUpcoming = type === "upcoming";

  const isCompleted = type === "completed";

  const isCancelled = type === "cancelled";

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

        <div className="flex items-center gap-2 lg:shrink-0">
          {isUpcoming && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-600">
              <CheckCircle2 size={14} />
              Confirmed
            </div>
          )}

          {isCompleted && (
            <span className="text-xs text-slate-400">Session completed</span>
          )}

          {isCancelled && (
            <span className="text-xs text-red-400">Session cancelled</span>
          )}
        </div>
      </div>
    </div>
  );
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
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
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

export default Sessions;
