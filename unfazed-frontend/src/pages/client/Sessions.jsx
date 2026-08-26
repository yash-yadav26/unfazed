import {  useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  UserRound,
} from "lucide-react";

function Sessions() {
  const [sessions] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("clientSessions") || "[]");
    } catch {
      return [];
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/client"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">
                Client Portal
              </p>
            </div>
          </Link>

          <Link
            to="/client"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* PAGE HEADER */}
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

          {/* UPCOMING */}
          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Upcoming Sessions
              </h2>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-600">
                {
                  sessions.filter(
                    (session) =>
                      session.status === "Confirmed",
                  ).length
                }{" "}
                Upcoming
              </span>
            </div>

            {sessions.filter(
              (session) =>
                session.status === "Confirmed",
            ).length > 0 ? (
              <div className="space-y-4">
                {sessions
                  .filter(
                    (session) =>
                      session.status ===
                      "Confirmed",
                  )
                  .map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      upcoming
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

          {/* COMPLETED */}
          <section className="mt-8">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Completed Sessions
            </h2>

            {sessions.filter(
              (session) =>
                session.status === "Completed",
            ).length > 0 ? (
              <div className="space-y-4">
                {sessions
                  .filter(
                    (session) =>
                      session.status ===
                      "Completed",
                  )
                  .map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
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

          {/* BOOK */}
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
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-700"
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
   SESSION CARD
========================================================= */

function SessionCard({ session, upcoming = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CalendarDays size={20} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {session.sessionType}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  upcoming
                    ? "bg-violet-50 text-violet-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {session.status}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserRound size={13} />
                {session.therapistName}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {session.date}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock3 size={13} />
                {session.time}
              </span>

              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                Online
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {upcoming ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-600">
              <CheckCircle2 size={14} />
              Confirmed
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Session completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Clock3 size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default Sessions;