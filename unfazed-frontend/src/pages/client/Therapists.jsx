import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartHandshake,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { getAllTherapists } from "../../api/therapistApi";

// ===============================
// Component
// ===============================

function Therapists() {
  const [therapists, setTherapists] = useState([]);

  const [search, setSearch] = useState("");

  const [specialization, setSpecialization] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ===============================
  // Fetch Real Therapists
  // ===============================

  useEffect(() => {
    const loadTherapists = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllTherapists();

        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        setTherapists(data);
      } catch (err) {
        console.error("Failed to load therapists:", err);

        setError(err.response?.data?.message || "Unable to load therapists.");
      } finally {
        setLoading(false);
      }
    };

    loadTherapists();
  }, []);

  // ===============================
  // Specialization Options
  // ===============================

  const specializationOptions = useMemo(() => {
    const specializations = therapists.flatMap((therapist) =>
      Array.isArray(therapist.specializations) ? therapist.specializations : [],
    );

    return ["All", ...new Set(specializations)];
  }, [therapists]);

  // ===============================
  // Filter Therapists
  // ===============================

  const filteredTherapists = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return therapists.filter((therapist) => {
      const therapistName = therapist.name?.toLowerCase() || "";

      const therapistBio = therapist.bio?.toLowerCase() || "";

      const therapistSpecializations = Array.isArray(therapist.specializations)
        ? therapist.specializations
        : [];

      const matchesSearch =
        !searchValue ||
        therapistName.includes(searchValue) ||
        therapistBio.includes(searchValue) ||
        therapistSpecializations.some((item) =>
          item?.toLowerCase().includes(searchValue),
        );

      const matchesSpecialization =
        specialization === "All" ||
        therapistSpecializations.includes(specialization);

      return matchesSearch && matchesSpecialization;
    });
  }, [therapists, search, specialization]);

  // ===============================
  // Clear Filters
  // ===============================

  const clearFilters = () => {
    setSearch("");
    setSpecialization("All");
  };

  // ===============================
  // Loading State
  // ===============================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link to="/client" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight text-slate-900">
                  Unfazed
                </p>

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

        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Book a Session
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Find a Therapist
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore therapist profiles and choose the therapist you would like
              to book a session with.
            </p>

            <div className="mt-7 flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                Loading therapists...
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===============================
  // Main UI
  // ===============================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===============================
          HEADER
      =============================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/client" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

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

      {/* ===============================
          MAIN
      =============================== */}

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* ===============================
              PAGE HEADER
          =============================== */}

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Book a Session
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Find a Therapist
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore therapist profiles and choose the therapist you would like
              to book a session with.
            </p>
          </div>

          {/* ===============================
              ERROR
          =============================== */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* ===============================
              SEARCH + FILTER
          =============================== */}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search therapist by name or specialization..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              {/* Specialization */}

              <div className="relative lg:w-64">
                <SlidersHorizontal
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  {specializationOptions.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All Specializations" : item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Count */}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {filteredTherapists.length} therapist
                {filteredTherapists.length !== 1 ? "s" : ""} available
              </p>

              {(search || specialization !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {/* ===============================
              THERAPISTS
          =============================== */}

          {filteredTherapists.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTherapists.map((therapist) => (
                <TherapistCard key={therapist._id} therapist={therapist} />
              ))}
            </div>
          ) : (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <UserRound size={22} />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-800">
                No therapists found
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Try a different name or specialization.
              </p>

              {(search || specialization !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                  Show All Therapists
                </button>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

// =========================================================
// Therapist Card
// =========================================================

function TherapistCard({ therapist }) {
  const specializations = Array.isArray(therapist.specializations)
    ? therapist.specializations
    : [];

  const languages = Array.isArray(therapist.languages)
    ? therapist.languages
    : [];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100">
      {/* ===============================
          CARD CONTENT
      =============================== */}

      <div className="flex-1 p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <UserRound size={24} />
          </div>

          {/* Therapist Basic Info */}

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">
              {therapist.name}
            </h2>

            <p className="mt-1 text-xs text-slate-500">Therapist</p>
          </div>
        </div>

        {/* ===============================
            Specializations
        =============================== */}

        {specializations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {specializations.map((item) => (
              <span
                key={item}
                className="inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-semibold text-violet-700"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* ===============================
            Bio
        =============================== */}

        <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500">
          {therapist.bio ||
            "Professional therapist available for therapy sessions."}
        </p>

        {/* ===============================
            Languages
        =============================== */}

        {languages.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {languages.map((language) => (
              <span
                key={language}
                className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500"
              >
                {language}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ===============================
          BOOK SESSION ONLY
      =============================== */}

      <div className="border-t border-slate-100 p-4">
        <Link
          to={`/client/booking/${therapist.slug}`}
          className="flex h-10 w-full items-center justify-center rounded-xl bg-violet-600 text-xs font-semibold text-white transition hover:bg-violet-700"
        >
          Book Session
        </Link>
      </div>
    </article>
  );
}

export default Therapists;
