import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartHandshake,
  Search,
  SlidersHorizontal,
  Users,
  CalendarDays,
  Clock3,
} from "lucide-react";

import { getMyClients } from "../../api/clientApi";

function Clients() {
  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     Fetch Therapist Clients
  ========================================================= */

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyClients();

        const clientData = Array.isArray(response?.data) ? response.data : [];

        setClients(clientData);
      } catch (error) {
        console.error("Failed to fetch clients:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load clients. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  /* =========================================================
     Filter + Sort
  ========================================================= */

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
     Render
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
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

          {/* Back */}

          <Link
            to="/therapist/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Page Heading */}

          <div>
            <div className="flex items-center gap-2 text-violet-600">
              <Users size={18} />

              <span className="text-xs font-bold uppercase tracking-wide">
                Client CRM
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Your Clients
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View clients who have booked sessions with you.
            </p>
          </div>

          {/* =================================================
              CLIENT TABLE
          ================================================== */}

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Toolbar */}

            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}

              <div className="relative w-full lg:max-w-lg">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-violet-500"
                >
                  <option value="name">Sort by Name</option>

                  <option value="sessions">Sort by Sessions</option>
                </select>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading clients...
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================== */}

            {!loading && error && (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Users size={22} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Unable to load clients
                </p>

                <p className="mt-1 text-xs text-red-500">{error}</p>
              </div>
            )}

            {/* =================================================
                TABLE
            ================================================== */}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] table-fixed">
                  <colgroup>
                    <col className="w-[30%]" />
                    <col className="w-[55%]" />
                    <col className="w-[15%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Client
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Booked Sessions
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((client) => (
                      <tr
                        key={client?._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* =================================================
                            CLIENT
                        ================================================== */}

                        <td className="px-6 py-5 align-top">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                              {getInitials(client?.name || "Client")}
                            </div>

                            {/* Details */}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
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
                            </div>
                          </div>
                        </td>

                        {/* =================================================
                            BOOKED SESSIONS
                        ================================================== */}

                        <td className="px-5 py-5 align-top">
                          {Array.isArray(client?.sessions) &&
                          client.sessions.length > 0 ? (
                            <div className="space-y-3">
                              {client.sessions.map((session, index) => (
                                <div
                                  key={session?._id}
                                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                                >
                                  {/* Session header */}

                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays
                                        size={14}
                                        className="shrink-0 text-violet-500"
                                      />

                                      <span className="text-xs font-semibold text-slate-700">
                                        Session {index + 1}
                                      </span>
                                    </div>

                                    <SessionStatus status={session?.status} />
                                  </div>

                                  {/* Date + Time */}

                                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                      <CalendarDays size={13} />

                                      <span>
                                        {formatSessionDate(session?.date)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                      <Clock3 size={13} />

                                      <span>
                                        {session?.startTime || "--:--"}
                                        {" - "}
                                        {session?.endTime || "--:--"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Duration + Payment */}

                                  <div className="mt-2 text-[11px] text-slate-400">
                                    Duration: {session?.duration ?? 0} minutes
                                    {" • "}
                                    Payment:{" "}
                                    {formatStatus(session?.paymentStatus)}
                                  </div>
                                </div>
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

                        <td className="px-5 py-5 align-top">
                          <div className="inline-flex items-center rounded-lg bg-violet-50 px-3 py-2">
                            <span className="text-sm font-bold text-violet-700">
                              {client?.sessionsCount || 0}
                            </span>

                            <span className="ml-1.5 text-xs font-medium text-violet-600">
                              {client?.sessionsCount === 1
                                ? "session"
                                : "sessions"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* =================================================
                    EMPTY STATE
                ================================================== */}

                {filteredClients.length === 0 && (
                  <div className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Users size={22} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      No clients found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {search
                        ? "Try a different name, email or phone number."
                        : "No clients have booked a session with you yet."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Privacy Note */}

          <div className="mt-5 text-center text-[11px] text-slate-400">
            Client information is private and visible only to authorized users.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   Session Status
========================================================= */

function SessionStatus({ status }) {
  const normalizedStatus = String(status || "").toUpperCase();

  let className = "bg-slate-100 text-slate-500";

  if (normalizedStatus === "CONFIRMED") {
    className = "bg-emerald-50 text-emerald-600";
  } else if (normalizedStatus === "PENDING") {
    className = "bg-amber-50 text-amber-600";
  } else if (normalizedStatus === "COMPLETED") {
    className = "bg-violet-50 text-violet-600";
  } else if (normalizedStatus === "CANCELLED") {
    className = "bg-red-50 text-red-600";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   Format Session Date
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
   Format Status
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
   Get Initials
========================================================= */

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default Clients;
