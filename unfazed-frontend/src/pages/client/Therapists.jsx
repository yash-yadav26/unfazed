import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  HeartHandshake,
  Languages,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { getAllTherapists } from "../../api/therapistApi";
import { getAvailableSessionSlots } from "../../api/sessionApi";

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name) => {
  const value = String(name || "Therapist").trim();

  if (!value) {
    return "T";
  }

  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getTodayDateString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getExperience = (therapist) => {
  const value =
    therapist?.experienceYears ??
    therapist?.yearsOfExperience ??
    therapist?.experience;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? String(value) : numericValue;
};

const getAvatarStyle = (index) => {
  const variants = [
    "from-violet-100 via-violet-50 to-indigo-100 text-violet-700 ring-violet-100",
    "from-indigo-100 via-indigo-50 to-violet-100 text-indigo-700 ring-indigo-100",
    "from-fuchsia-100 via-violet-50 to-indigo-100 text-fuchsia-700 ring-fuchsia-100",
    "from-sky-100 via-white to-violet-100 text-sky-700 ring-sky-100",
  ];

  return variants[index % variants.length];
};

/* =========================================================
   COMPONENT
========================================================= */

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [availabilityByTherapistId, setAvailabilityByTherapistId] = useState(
    {},
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  /* =========================================================
     FETCH THERAPISTS
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

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

        if (isMounted) {
          setTherapists(data);
        }
      } catch (err) {
        console.error("Failed to load therapists:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message || "Unable to load therapists.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTherapists();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     FETCH TODAY'S SESSION DETAILS
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const loadSessionDetails = async () => {
      if (!therapists.length) {
        setAvailabilityByTherapistId({});
        return;
      }

      try {
        setAvailabilityLoading(true);

        const today = getTodayDateString();

        const results = await Promise.allSettled(
          therapists.map(async (therapist) => {
            if (!therapist?._id) {
              return null;
            }

            const response = await getAvailableSessionSlots({
              therapistId: therapist._id,
              date: today,
            });

            const data = response?.data || {};

            return {
              therapistId: String(therapist._id),
              sessionDuration: data.sessionDuration ?? null,
              price: data.price ?? null,
            };
          }),
        );

        if (!isMounted) {
          return;
        }

        const availabilityMap = {};

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.therapistId) {
            availabilityMap[result.value.therapistId] = {
              sessionDuration: result.value.sessionDuration,
              price: result.value.price,
            };
          }
        });

        setAvailabilityByTherapistId(availabilityMap);
      } catch (err) {
        console.error("Failed to load therapist session details:", err);
      } finally {
        if (isMounted) {
          setAvailabilityLoading(false);
        }
      }
    };

    loadSessionDetails();

    return () => {
      isMounted = false;
    };
  }, [therapists]);

  /* =========================================================
     SPECIALIZATION OPTIONS
  ========================================================== */

  const specializationOptions = useMemo(() => {
    const specializations = therapists.flatMap((therapist) =>
      Array.isArray(therapist?.specializations)
        ? therapist.specializations.filter(Boolean)
        : [],
    );

    return ["All", ...new Set(specializations)];
  }, [therapists]);

  /* =========================================================
     FILTER THERAPISTS
  ========================================================== */

  const filteredTherapists = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return therapists.filter((therapist) => {
      const therapistName = String(therapist?.name || "").toLowerCase();

      const therapistBio = String(therapist?.bio || "").toLowerCase();

      const therapistSpecializations = Array.isArray(therapist?.specializations)
        ? therapist.specializations
        : [];

      const therapistLanguages = Array.isArray(therapist?.languages)
        ? therapist.languages
        : [];

      const matchesSearch =
        !searchValue ||
        therapistName.includes(searchValue) ||
        therapistBio.includes(searchValue) ||
        therapistSpecializations.some((item) =>
          String(item || "")
            .toLowerCase()
            .includes(searchValue),
        ) ||
        therapistLanguages.some((item) =>
          String(item || "")
            .toLowerCase()
            .includes(searchValue),
        );

      const matchesSpecialization =
        specialization === "All" ||
        therapistSpecializations.includes(specialization);

      return matchesSearch && matchesSpecialization;
    });
  }, [therapists, search, specialization]);

  const clearFilters = () => {
    setSearch("");
    setSpecialization("All");
  };

  const hasFilters = Boolean(search.trim()) || specialization !== "All";

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
        <div className="pointer-events-none fixed -left-28 top-24 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />
        <div className="pointer-events-none fixed -right-28 top-44 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link to="/client" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <HeartHandshake size={19} />
              </div>

              <div>
                <p className="text-base font-extrabold tracking-tight text-slate-950">
                  Unfazed
                </p>

                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Client Portal
                </p>
              </div>
            </Link>

            <Link
              to="/client"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 shadow-sm">
                <Sparkles size={12} className="text-violet-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                  Book a Session
                </span>
              </div>

              <div className="mt-4 h-9 w-72 animate-pulse rounded-2xl bg-slate-200" />
              <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-4 w-2/3 max-w-lg animate-pulse rounded-full bg-slate-100" />
            </div>

            <div className="mt-8 h-24 animate-pulse rounded-3xl border border-slate-200 bg-white" />

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-28 animate-pulse bg-gradient-to-r from-violet-50 via-white to-indigo-50" />
                  <div className="space-y-4 p-5">
                    <div className="-mt-11 h-16 w-16 animate-pulse rounded-2xl bg-slate-200 ring-8 ring-white" />
                    <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}
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
    <div className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* Background ambience */}
      <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 top-16 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/20 blur-3xl" />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/client" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 transition duration-300 group-hover:-translate-y-0.5">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight text-slate-950">
                Unfazed
              </p>

              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Client Portal
              </p>
            </div>
          </Link>

          <Link
            to="/client"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="relative mx-auto max-w-7xl">
          {/* =================================================
              HERO
          ================================================== */}

          <section className="relative overflow-hidden rounded-[30px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/65 to-indigo-50/70 p-6 shadow-[0_20px_70px_-30px_rgba(99,102,241,0.30)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-indigo-300/15 blur-3xl" />

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Sparkles size={11} />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                  Book a Session
                </span>

                <span className="h-1 w-1 rounded-full bg-emerald-400" />

                <span className="text-[9px] font-semibold text-emerald-600">
                  Find the right support
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
                Find a therapist who{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  feels right
                </span>
                .
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Explore therapist profiles, specialties and languages, then
                choose the one you would like to book a session with.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                  <BadgeCheck size={13} className="text-violet-600" />
                  <span className="text-[10px] font-semibold text-slate-600">
                    Professional profiles
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                  <HeartHandshake size={13} className="text-indigo-600" />
                  <span className="text-[10px] font-semibold text-slate-600">
                    Care that fits you
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-[10px] font-semibold text-slate-600">
                    Simple booking
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Unable to load therapists
                </p>

                <p className="mt-1 text-xs leading-5 text-red-500">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================================
              SEARCH + FILTER
          ================================================== */}

          <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)] sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by therapist name, specialty or language..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Specialization */}

              <div className="relative lg:w-72">
                <SlidersHorizontal
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={specialization}
                  onChange={(event) => setSpecialization(event.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-10 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  {specializationOptions.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All Specializations" : item}
                    </option>
                  ))}
                </select>

                <ChevronRight
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-700">
                  {filteredTherapists.length}{" "}
                  {filteredTherapists.length === 1 ? "therapist" : "therapists"}{" "}
                  available
                </span>

                {specialization !== "All" && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold text-indigo-700">
                    {specialization}
                  </span>
                )}

                {search && (
                  <span className="max-w-[220px] truncate rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                    “{search}”
                  </span>
                )}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-violet-600 transition hover:text-violet-800"
                >
                  <X size={13} />
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {/* =================================================
              THERAPISTS
          ================================================== */}

          {filteredTherapists.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTherapists.map((therapist, index) => (
                <TherapistCard
                  key={therapist?._id}
                  therapist={therapist}
                  index={index}
                  availability={
                    availabilityByTherapistId[String(therapist?._id)]
                  }
                  availabilityLoading={availabilityLoading}
                />
              ))}
            </div>
          ) : (
            <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 ring-8 ring-violet-50">
                <Search size={25} />
              </div>

              <h2 className="mt-6 text-xl font-extrabold tracking-tight text-slate-900">
                No therapists found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn’t find a therapist matching your current search or
                specialization filter.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </section>
          )}

          <div className="mt-8 text-center text-[10px] font-medium text-slate-400">
            Your wellbeing comes first. Take your time choosing the right
            therapist for you.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   THERAPIST CARD
========================================================= */

function TherapistCard({ therapist, index, availability, availabilityLoading }) {
  const specializations = Array.isArray(therapist?.specializations)
    ? therapist.specializations.filter(Boolean)
    : [];

  const languages = Array.isArray(therapist?.languages)
    ? therapist.languages.filter(Boolean)
    : [];

  const experience = getExperience(therapist);
  const initials = getInitials(therapist?.name);
  const avatarStyle = getAvatarStyle(index);

  const imageUrl =
    therapist?.profileImage || therapist?.avatar || therapist?.image || null;

  return (
    <article className="group relative flex min-h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-[0_16px_45px_-28px_rgba(15,23,42,0.24)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_26px_60px_-28px_rgba(99,102,241,0.32)]">
      {/* =====================================================
          CARD TOP AREA
      ====================================================== */}

      <div className="relative h-[108px] shrink-0 overflow-hidden bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-violet-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-indigo-200/25 blur-2xl" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />

        <div className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-2.5 py-1.5 text-[9px] font-bold text-violet-700 shadow-sm backdrop-blur-md">
          <Sparkles size={10} />
          Therapist
        </div>

        <div className="absolute right-5 top-4 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white/85 px-2.5 py-1.5 text-[9px] font-bold text-emerald-600 shadow-sm backdrop-blur-md">
          <BadgeCheck size={11} />
          Verified
        </div>
      </div>

      {/* =====================================================
          CARD CONTENT
      ====================================================== */}

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        {/* Avatar */}

        <div
          className={`relative z-10 -mt-8 flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br ${avatarStyle} text-lg font-extrabold shadow-xl ring-[7px] ring-white transition duration-300 group-hover:scale-[1.03]`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={therapist?.name || "Therapist"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-extrabold tracking-tight text-slate-900">
                {therapist?.name || "Therapist"}
              </h2>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Mental Health Professional
              </p>
            </div>
          </div>
        </div>

        {/* Experience */}

        {experience !== null && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600">
              <Check size={11} className="text-emerald-500" />
              {experience} {Number(experience) === 1 ? "year" : "years"}{" "}
              experience
            </span>
          </div>
        )}

        {/* Languages */}

        {languages.length > 0 && (
          <div className="mt-3">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-700">
              <Languages size={11} className="shrink-0" />
              <span className="truncate">
                {languages.slice(0, 2).join(" • ")}
                {languages.length > 2 ? " +" : ""}
              </span>
            </span>
          </div>
        )}

        {/* Specializations */}

        {specializations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {specializations.slice(0, 3).map((item) => (
              <span
                key={item}
                className="rounded-full bg-violet-50 px-2.5 py-1.5 text-[9px] font-bold text-violet-700"
              >
                {item}
              </span>
            ))}

            {specializations.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-500">
                +{specializations.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Session Details */}

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                <span className="text-[11px] font-extrabold">◷</span>
              </span>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Session
                </p>

                <p className="mt-0.5 truncate text-[11px] font-extrabold text-slate-800">
                  {availability?.sessionDuration !== null &&
                  availability?.sessionDuration !== undefined
                    ? `${availability.sessionDuration} min`
                    : availabilityLoading
                      ? "Loading..."
                      : "Not set"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                <span className="text-[11px] font-extrabold">₹</span>
              </span>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Fee
                </p>

                <p className="mt-0.5 truncate text-[11px] font-extrabold text-slate-800">
                  {availability?.price !== null &&
                  availability?.price !== undefined
                    ? `₹${Number(availability.price).toLocaleString("en-IN")}`
                    : availabilityLoading
                      ? "Loading..."
                      : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}

        <p className="mt-4 line-clamp-3 text-[12px] leading-5 text-slate-500">
          {therapist?.bio ||
            "Professional therapist available for therapy sessions tailored to your needs."}
        </p>

        {/* CTA */}

        <div className="mt-auto pt-5">
          <Link
            to={`/client/booking/${therapist?.slug}`}
            className="group/button relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-violet-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/button:translate-x-full" />

            <span className="relative">Book Session</span>

            <ChevronRight
              size={15}
              className="relative transition duration-200 group-hover/button:translate-x-1"
            />
          </Link>

          <p className="mt-2 text-center text-[9px] font-medium text-slate-400">
            Choose a therapist & pick a time
          </p>
        </div>
      </div>
    </article>
  );
}

export default Therapists;
