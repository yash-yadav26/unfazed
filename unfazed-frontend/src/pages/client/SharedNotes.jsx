import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  HeartHandshake,
  UserRound,
} from "lucide-react";

import { getMySharedNotes } from "../../api/notesApi";

function SharedNotes() {
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD SHARED NOTES
     ---------------------------------------------------------
     GET /api/notes/shared
     ---------------------------------------------------------
     Backend automatically returns only SHARED notes.
  ========================================================= */

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMySharedNotes();

        /*
         * Expected backend response:
         *
         * {
         *   success: true,
         *   statusCode: 200,
         *   message: "Shared notes fetched successfully.",
         *   data: [...]
         * }
         */

        const sharedNotes = Array.isArray(response?.data) ? response.data : [];

        /*
         * Backend se jo actual data aa raha hai
         * usko UI-friendly shape mein normalize kar rahe hain.
         */
        const normalizedNotes = sharedNotes.map((note) => ({
          ...note,

          id: note?._id,

          type: note?.type,

          therapistName: note?.therapistId?.name || "Your Therapist",

          sessionDate: note?.sessionId?.date || null,

          sessionStartTime: note?.sessionId?.startTime || null,

          sessionEndTime: note?.sessionId?.endTime || null,

          date: note?.createdAt || note?.sessionId?.date || null,

          /*
           * Current backend model mein title field nahi hai,
           * isliye fixed display title use kar rahe hain.
           */
          title: "Session Note",
        }));

        /*
         * Safety layer:
         * Frontend par bhi PRIVATE notes display nahi karenge.
         *
         * Actual security backend/API level par already
         * type: "SHARED" query se enforce hoti hai.
         */
        const sharedOnly = normalizedNotes.filter(
          (note) => String(note?.type || "").toUpperCase() === "SHARED",
        );

        setNotes(sharedOnly);
      } catch (error) {
        console.error("Failed to fetch shared notes:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load shared notes. Please try again.",
        );

        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNotes();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/client" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="pointer-events-none fixed -left-32 top-24 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-20 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/15 blur-3xl" />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                Client Portal
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Shared Notes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Notes your therapist has chosen to share with you.
            </p>
          </div>

          {/* =================================================
              INFO
          ================================================== */}

          <section className="relative mt-7 overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_18px_55px_-35px_rgba(99,102,241,0.26)]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm ring-1 ring-violet-100">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Notes shared with you
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your therapist may share selected notes or follow-up
                  information with you after a session.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              NOTES
          ================================================== */}

          <section className="mt-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_65px_-35px_rgba(15,23,42,0.24)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/20 to-indigo-50/30 px-5 py-4.5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Your Shared Notes
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {notes.length} shared note
                    {notes.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <FileText size={19} className="text-violet-600" />
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* =================================================
                  LOADING
              ================================================== */}

              {loading && <LoadingState />}

              {/* =================================================
                  ERROR
              ================================================== */}

              {!loading && error && <ErrorState message={error} />}

              {/* =================================================
                  NOTES
              ================================================== */}

              {!loading && !error && notes.length > 0 && (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <SharedNoteCard key={note.id} note={note} />
                  ))}
                </div>
              )}

              {/* =================================================
                  EMPTY
              ================================================== */}

              {!loading && !error && notes.length === 0 && <EmptyState />}
            </div>
          </section>

          {/* =================================================
              PRIVACY NOTE
          ================================================== */}

          <div className="mt-5 text-center text-[10px] text-slate-400">
            Only notes specifically shared by your therapist are visible here.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SHARED NOTE CARD
========================================================= */

function SharedNoteCard({ note }) {
  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.20)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_24px_60px_-30px_rgba(99,102,241,0.24)]">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm ring-1 ring-violet-100">
            <FileText size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {note?.title || "Session Note"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
              {/* Therapist */}

              <span className="flex items-center gap-1.5">
                <UserRound size={12} />

                {note?.therapistName || "Your Therapist"}
              </span>

              {/* Session Date */}

              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} />

                {formatDate(note?.sessionDate)}
              </span>
            </div>

            {/* Session Time */}

            {(note?.sessionStartTime || note?.sessionEndTime) && (
              <p className="mt-2 text-[10px] text-slate-400">
                Session time: {note?.sessionStartTime || "--:--"}
                {" - "}
                {note?.sessionEndTime || "--:--"}
              </p>
            )}
          </div>
        </div>

        <span className="self-start rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 shadow-sm">
          Shared with you
        </span>
      </div>

      {/* Content */}

      <div className="mt-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-4.5 shadow-inner">
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {note?.content || "No note content available."}
        </p>
      </div>

      {/* Footer */}

      <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
        Shared on {formatDate(note?.date)}
      </div>
    </article>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-slate-200" />

              <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-5 h-24 rounded-2xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({ message }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-gradient-to-br from-red-50 to-white px-5 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm ring-8 ring-red-50/60">
        <FileText size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        Unable to load shared notes
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-red-500">
        {message}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-400 shadow-sm ring-8 ring-violet-50">
        <FileText size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        No shared notes yet
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Notes shared by your therapist will appear here after they choose to
        share them with you.
      </p>
    </div>
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {
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

export default SharedNotes;
