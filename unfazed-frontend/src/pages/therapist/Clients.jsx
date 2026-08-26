import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  HeartHandshake,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";

const initialClients = [
  {
    id: "1",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    lastSession: "Today, 10:00 AM",
    status: "Active",
    tags: ["Anxiety"],
  },
  {
    id: "2",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    lastSession: "Yesterday, 11:30 AM",
    status: "Active",
    tags: ["Stress"],
  },
  {
    id: "3",
    name: "Priya Singh",
    email: "priya@example.com",
    lastSession: "14 Aug 2026",
    status: "Active",
    tags: ["Relationships"],
  },
  {
    id: "4",
    name: "Arjun Verma",
    email: "arjun@example.com",
    lastSession: "12 Aug 2026",
    status: "Inactive",
    tags: ["Follow-up"],
  },
  {
    id: "5",
    name: "Neha Gupta",
    email: "neha@example.com",
    lastSession: "10 Aug 2026",
    status: "Active",
    tags: ["Depression"],
  },
];

function Clients() {
  const [clients] = useState(initialClients);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const filteredClients = useMemo(() => {
    const filtered = clients.filter((client) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        client.name.toLowerCase().includes(searchValue) ||
        client.email.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        client.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }

      return 0;
    });
  }, [clients, search, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <Link
            to="/therapist/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">
                Therapist Dashboard
              </p>
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
              View and manage the clients associated with your practice.
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
                  placeholder="Search clients..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />

              </div>


              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <SlidersHorizontal size={15} />
                  Filter
                </div>

                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === "all"
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-200"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === "active"
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-200"
                  }`}
                >
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("inactive")}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === "inactive"
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-200"
                  }`}
                >
                  Inactive
                </button>

                <div className="ml-1 flex items-center gap-2">
                  <Filter
                    size={15}
                    className="text-slate-400"
                  />

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-violet-500"
                  >
                    <option value="name">
                      Sort by Name
                    </option>

                    <option value="status">
                      Sort by Status
                    </option>
                  </select>
                </div>

              </div>

            </div>


            {/* =================================================
                TABLE
            ================================================== */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] table-fixed">

                <colgroup>
                  <col className="w-[31%]" />
                  <col className="w-[21%]" />
                  <col className="w-[14%]" />
                  <col className="w-[20%]" />
                  <col className="w-[14%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Name
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Last Session
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Tags
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      View
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-slate-100">

                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition hover:bg-slate-50/70"
                    >

                      {/* Name + Email */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {getInitials(client.name)}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {client.name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {client.email}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Last Session */}
                      <td className="px-5 py-5">

                        <p className="text-sm font-medium text-slate-700">
                          {client.lastSession}
                        </p>

                      </td>


                      {/* Status */}
                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                            client.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {client.status}
                        </span>

                      </td>


                      {/* Tags */}
                      <td className="px-5 py-5">

                        <div className="flex flex-wrap items-center gap-2">

                          {client.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-violet-50 px-3 py-1.5 text-[10px] font-medium text-violet-600"
                            >
                              {tag}
                            </span>
                          ))}

                        </div>

                      </td>


                      {/* View */}
                      <td className="px-4 py-5">

                        <Link
                          to={`/therapist/clients/${client.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                        >
                          View
                          <ChevronRight size={14} />
                        </Link>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>


              {/* Empty State */}
              {filteredClients.length === 0 && (
                <div className="px-5 py-16 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Users size={22} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No clients found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or filter.
                  </p>

                </div>
              )}

            </div>

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
   HELPERS
========================================================= */

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default Clients;