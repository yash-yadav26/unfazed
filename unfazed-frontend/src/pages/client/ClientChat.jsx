import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Circle,
  HeartHandshake,
  Loader2,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getSessionById } from "../../api/sessionApi";
import ChatWindow from "../../components/chat/ChatWindow";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const VALID_CHAT_STATUSES = [
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "NO_SHOW",
];

/* -------------------------------------------------------------------------- */
/*                             Client Chat Page                               */
/* -------------------------------------------------------------------------- */

const ClientChat = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /*                         Fetch Session Details                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      if (!sessionId) {
        setError("Session ID is required.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getSessionById(sessionId);

        if (!isMounted) {
          return;
        }

        const sessionData = response?.data;

        if (!sessionData) {
          setError("Session details could not be found.");
          return;
        }

        setSession(sessionData);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to fetch session details:", err);

        setError(err?.response?.data?.message || "Unable to open this chat.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  /* ------------------------------------------------------------------------ */
  /*                           Loading State                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
        <PageHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[650px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <Loader2 className="animate-spin text-violet-600" size={26} />
                </div>

                <h2 className="mt-4 text-base font-bold text-slate-800">
                  Preparing your chat
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Loading your therapist details...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                              Error State                                 */
  /* ------------------------------------------------------------------------ */

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
        <PageHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <MessageCircle size={26} className="text-red-500" />
              </div>

              <h1 className="mt-5 text-xl font-bold text-slate-900">
                Unable to open chat
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error || "The requested session could not be loaded."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/client/sessions")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Sessions
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                         Therapist Details                                */
  /* ------------------------------------------------------------------------ */

  const therapist =
    session?.therapistId && typeof session.therapistId === "object"
      ? session.therapistId
      : null;

  const therapistId = therapist?._id || session?.therapistId;

  const therapistName =
    therapist?.name || session?.therapistName || "Therapist";

  const status = String(session?.status || "").toUpperCase();

  const canChat = VALID_CHAT_STATUSES.includes(status);

  /* ------------------------------------------------------------------------ */
  /*                       Invalid Chat Status                                */
  /* ------------------------------------------------------------------------ */

  if (!canChat) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
        <PageHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                <MessageCircle size={26} className="text-amber-500" />
              </div>

              <h1 className="mt-5 text-xl font-bold text-slate-900">
                Chat is unavailable
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Chat is available for confirmed, active, completed, or missed
                therapy sessions.
              </p>

              <button
                type="button"
                onClick={() => navigate("/client/sessions")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Sessions
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                             Main UI                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <PageHeader />

      <main className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ---------------------------------------------------------------- */}
          {/*                         Breadcrumb                                */}
          {/* ---------------------------------------------------------------- */}

          <div className="mb-5 flex items-center gap-2 text-sm">
            <Link
              to="/client/sessions"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-violet-600"
            >
              <ChevronLeft size={16} />
              My Sessions
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-semibold text-slate-800">Chat</span>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/*                          Therapist Card                           */}
          {/* ---------------------------------------------------------------- */}

          <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
              {/* Background Decoration */}

              <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-violet-100/70 blur-2xl" />

              <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-indigo-100/60 blur-2xl" />

              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Therapist */}

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
                    <UserRound size={24} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        {therapistName}
                      </h1>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                        <Circle size={7} className="fill-current" />
                        Chat available
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {formatDate(session?.date)}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {formatTime(session?.startTime)}
                      </span>

                      <span>{formatStatus(status)}</span>
                    </div>
                  </div>
                </div>

                {/* Session Info */}

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Private conversation
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/client/sessions")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/*                           Chat Area                               */}
          {/* ---------------------------------------------------------------- */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex min-h-[680px] flex-col">
              {therapistId ? (
                <ChatWindow
                  otherUserId={therapistId}
                  otherUserName={therapistName}
                />
              ) : (
                <div className="flex min-h-[680px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <MessageCircle size={25} className="text-slate-400" />
                    </div>

                    <h2 className="mt-4 text-base font-bold text-slate-800">
                      Therapist information unavailable
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      We could not identify the therapist for this session.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/*                         Privacy Note                              */}
          {/* ---------------------------------------------------------------- */}

          <div className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-5 text-slate-400">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />

            <p>
              Your conversation is available only between you and the therapist
              associated with this booking.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Page Header                                 */
/* -------------------------------------------------------------------------- */

const PageHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/client" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <HeartHandshake size={18} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-950">
              Unfazed
            </p>

            <p className="text-[9px] font-medium text-slate-500">
              Client Portal
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500">
            <MessageCircle size={13} />
            Secure Chat
          </div>
        </div>
      </div>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Format Helpers                                 */
/* -------------------------------------------------------------------------- */

const normalizeDate = (date) => {
  if (!date) {
    return "";
  }

  return String(date).slice(0, 10);
};

const formatDate = (dateValue) => {
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
};

const formatTime = (timeValue) => {
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
};

const formatStatus = (status) => {
  if (!status) {
    return "";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default ClientChat;
