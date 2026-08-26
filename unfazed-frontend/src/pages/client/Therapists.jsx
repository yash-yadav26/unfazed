import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartHandshake,
  MapPin,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

function Therapists() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  /*
   * Mock therapist data
   *
   * Later backend/API se aayega.
   * Therapist ka slug public profile URL ke liye use hoga.
   */
  const therapists = useMemo(
    () => [
      {
        id: "1",
        name: "Dr. Sharma",
        slug: "dr-sharma",
        title: "Clinical Psychologist",
        specialization: "Anxiety & Stress",
        location: "India",
        experience: "8 years",
        languages: ["English", "Hindi"],
        bio: "Helps clients work through anxiety, stress and emotional challenges with a practical and supportive approach.",
      },
      {
        id: "2",
        name: "Dr. Neha Gupta",
        slug: "dr-neha-gupta",
        title: "Counselling Psychologist",
        specialization: "Relationships",
        location: "India",
        experience: "6 years",
        languages: ["English", "Hindi", "Hinglish"],
        bio: "Focuses on relationship concerns, emotional wellbeing and helping clients build healthier communication patterns.",
      },
      {
        id: "3",
        name: "Dr. Rahul Mehta",
        slug: "dr-rahul-mehta",
        title: "Therapist",
        specialization: "Depression",
        location: "India",
        experience: "7 years",
        languages: ["English", "Hindi"],
        bio: "Supports clients dealing with depression, low motivation and difficult life transitions.",
      },
      {
        id: "4",
        name: "Dr. Priya Singh",
        slug: "dr-priya-singh",
        title: "Clinical Psychologist",
        specialization: "Family & Parenting",
        location: "India",
        experience: "9 years",
        languages: ["English", "Hindi"],
        bio: "Works with family concerns, parenting challenges and emotional development.",
      },
      {
        id: "5",
        name: "Dr. Anjali Verma",
        slug: "dr-anjali-verma",
        title: "Counselling Psychologist",
        specialization: "Trauma & PTSD",
        location: "India",
        experience: "5 years",
        languages: ["English", "Hindi"],
        bio: "Provides a calm and supportive space for clients dealing with trauma and difficult experiences.",
      },
      {
        id: "6",
        name: "Dr. Karan Joshi",
        slug: "dr-karan-joshi",
        title: "Therapist",
        specialization: "Career & Life Coaching",
        location: "India",
        experience: "6 years",
        languages: ["English", "Hindi"],
        bio: "Helps clients with career decisions, confidence, life transitions and personal growth.",
      },
    ],
    []
  );

  /* =========================================================
     SPECIALIZATION OPTIONS
  ========================================================== */

  const specializationOptions = [
    "All",
    ...new Set(therapists.map((therapist) => therapist.specialization)),
  ];

  /* =========================================================
     FILTER
  ========================================================== */

  const filteredTherapists = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return therapists.filter((therapist) => {
      const matchesSearch =
        !searchValue ||
        therapist.name.toLowerCase().includes(searchValue) ||
        therapist.title.toLowerCase().includes(searchValue) ||
        therapist.specialization.toLowerCase().includes(searchValue);

      const matchesSpecialization =
        specialization === "All" || therapist.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [search, specialization, therapists]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}

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

          {/* Back */}

          <Link
            to="/client"
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

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

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

          {/* =================================================
              SEARCH + FILTER
          ================================================== */}

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

              {/* Filter */}

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

            {/* Result count */}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {filteredTherapists.length} therapist
                {filteredTherapists.length !== 1 ? "s" : ""} available
              </p>

              {(search || specialization !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSpecialization("All");
                  }}
                  className="text-xs font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {/* =================================================
              THERAPIST LIST
          ================================================== */}

          {filteredTherapists.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTherapists.map((therapist) => (
                <TherapistCard key={therapist.id} therapist={therapist} />
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

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSpecialization("All");
                }}
                className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                Show All Therapists
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   THERAPIST CARD
========================================================= */

function TherapistCard({ therapist }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100">
      {/* Top */}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <UserRound size={24} />
          </div>

          {/* Basic */}

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">
              {therapist.name}
            </h2>

            <p className="mt-1 text-xs text-slate-500">{therapist.title}</p>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
              <MapPin size={11} />

              {therapist.location}
            </div>
          </div>
        </div>

        {/* Specialization */}

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-semibold text-violet-700">
            {therapist.specialization}
          </span>
        </div>

        {/* Bio */}

        <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500">
          {therapist.bio}
        </p>

        {/* Experience + Languages */}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500">
            {therapist.experience}
          </span>

          {therapist.languages.map((language) => (
            <span
              key={language}
              className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500"
            >
              {language}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}

      <div className="flex items-center gap-2 border-t border-slate-100 p-4">
        {/* Public profile */}

        <Link
          to={`/${therapist.slug}`}
          className="flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          View Profile
        </Link>

        {/* Direct booking */}

        <Link
          to={`/client/booking/${therapist.slug}`}
          className="flex h-10 flex-1 items-center justify-center rounded-xl bg-violet-600 text-xs font-semibold text-white transition hover:bg-violet-700"
        >
          Book Session
        </Link>
      </div>
    </article>
  );
}

export default Therapists;
