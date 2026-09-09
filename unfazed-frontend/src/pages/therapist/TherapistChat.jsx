import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Circle,
  HeartHandshake,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { getMyClients } from "../../api/clientApi";
import ChatWindow from "../../components/chat/ChatWindow";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const CHAT_ALLOWED_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"];

/* -------------------------------------------------------------------------- */
/*                           Therapist Chat Page                              */
/* -------------------------------------------------------------------------- */

const TherapistChat = () => {
  const { id: clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /*                         Fetch Client Details                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isMounted = true;

    const loadClient = async () => {
      if (!clientId) {
        const message = "Client ID is required.";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getMyClients();

        if (!isMounted) {
          return;
        }

        const clientList = Array.isArray(response?.data) ? response.data : [];

        const matchedClient = clientList.find(
          (item) => String(item?._id) === String(clientId),
        );

        if (!matchedClient) {
          const message =
            "Client not found or you are not authorized to access this client.";
          setError(message);
          toast.error(message);
          return;
        }

        setClient(matchedClient);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load client:", err);

        const message =
          err?.response?.data?.message || "Unable to open this chat.";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClient();

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  /* ------------------------------------------------------------------------ */
  /*                        Chat Eligibility                                  */
  /* ------------------------------------------------------------------------ */

  const eligibleSession = useMemo(() => {
    if (!Array.isArray(client?.sessions) || client.sessions.length === 0) {
      return null;
    }

    return (
      client.sessions.find((session) => {
        const status = String(session?.status || "").toUpperCase();

        return CHAT_ALLOWED_STATUSES.includes(status);
      }) || null
    );
  }, [client]);

  const canChat = Boolean(eligibleSession);

  /* ------------------------------------------------------------------------ */
  /*                           Loading State                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        <PageHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[680px] items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <Loader2 size={26} className="animate-spin text-violet-600" />
                </div>

                <h2 className="mt-4 text-base font-bold text-slate-800">
                  Preparing client chat
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Loading client details...
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

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        <PageHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <MessageCircle size={26} className="text-red-500" />
              </div>

              <h1 className="mt-5 text-xl font-bold text-slate-900">
                Unable to open chat
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error || "The requested client could not be found."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/therapist/clients")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Clients
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                       Chat Not Available                                 */
  /* ------------------------------------------------------------------------ */

  if (!canChat) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        <PageHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                <MessageCircle size={26} className="text-amber-500" />
              </div>

              <h1 className="mt-5 text-xl font-bold text-slate-900">
                Chat is unavailable
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                This client does not currently have a confirmed, active, or
                completed session with you.
              </p>

              <button
                type="button"
                onClick={() => navigate("/therapist/clients")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Clients
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                            Client Details                                */
  /* ------------------------------------------------------------------------ */

  const clientName = client?.name || "Client";

  const clientEmail = client?.email || "Email not available";

  const clientPhone = client?.phone || null;

  const sessionStatus = String(eligibleSession?.status || "").toUpperCase();

  /* ------------------------------------------------------------------------ */
  /*                              Main UI                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <PageHeader />

      <main className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-7 lg:px-10">
        {/* Background decoration */}

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* ---------------------------------------------------------------- */}
          {/*                         Breadcrumb                                */}
          {/* ---------------------------------------------------------------- */}

          <div className="mb-5 flex items-center gap-2 text-sm">
            <Link
              to="/therapist/clients"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-violet-600"
            >
              <ChevronLeft size={16} />
              My Clients
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-semibold text-slate-800">Chat</span>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/*                         Client Hero                               */}
          {/* ---------------------------------------------------------------- */}

          <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)]">
            <div className="relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
              {/* Decorative gradients */}

              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-100/80 blur-3xl" />

              <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-indigo-100/60 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Client */}

                <div className="flex items-center gap-4">
                  {/* Avatar */}

                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-violet-200">
                    {getInitials(clientName)}

                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
                  </div>

                  {/* Client Info */}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        {clientName}
                      </h1>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                        <Circle size={7} className="fill-current" />
                        Chat available
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span>{clientEmail}</span>

                      {clientPhone && <span>{clientPhone}</span>}

                      {sessionStatus && (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2
                            size={13}
                            className="text-emerald-500"
                          />
                          {formatStatus(sessionStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Information */}

                <div className="flex flex-wrap items-center gap-2">
                  {/* Privacy */}

                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Private conversation
                  </div>

                  {/* Back */}

                  <button
                    type="button"
                    onClick={() => navigate("/therapist/clients")}
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
          {/*                         Session Summary                           */}
          {/* ---------------------------------------------------------------- */}

          <section className="mb-5 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={<CalendarDays size={17} />}
              label="Sessions"
              value={client?.sessionsCount ?? client?.sessions?.length ?? 0}
              description="Booked together"
            />

            <SummaryCard
              icon={<CheckCircle2 size={17} />}
              label="Status"
              value={formatStatus(sessionStatus)}
              description="Latest eligible session"
            />

            <SummaryCard
              icon={<MessageCircle size={17} />}
              label="Conversation"
              value="Private"
              description="Therapist ↔ Client"
            />
          </section>

          {/* ---------------------------------------------------------------- */}
          {/*                           Chat Area                               */}
          {/* ---------------------------------------------------------------- */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex min-h-[680px] flex-col">
              <ChatWindow otherUserId={clientId} otherUserName={clientName} />
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/*                           Privacy                                 */}
          {/* ---------------------------------------------------------------- */}

          <div className="mt-4 flex items-start justify-center gap-2 px-1 text-center text-[11px] leading-5 text-slate-400">
            <ShieldCheck
              size={14}
              className="mt-0.5 shrink-0 text-emerald-500"
            />

            <p>
              This conversation is available only between you and your
              authorized client.
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          to="/therapist/dashboard"
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200 transition group-hover:scale-105">
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
/*                              Summary Card                                  */
/* -------------------------------------------------------------------------- */

const SummaryCard = ({ icon, label, value, description }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_15px_40px_-32px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Get Initials                                  */
/* -------------------------------------------------------------------------- */

const getInitials = (name) => {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

/* -------------------------------------------------------------------------- */
/*                              Format Status                                 */
/* -------------------------------------------------------------------------- */

const formatStatus = (status) => {
  if (!status) {
    return "N/A";
  }

  return String(status)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default TherapistChat;
