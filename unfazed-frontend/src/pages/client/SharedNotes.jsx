import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  HeartHandshake,
  UserRound,
} from "lucide-react";

function SharedNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD SHARED NOTES

     Backend later:
     GET /notes/shared

     IMPORTANT:
     API se sirf type === "shared" notes hi aane chahiye.
  ========================================================== */

  useEffect(() => {
    let isActive = true;

    const timer = setTimeout(() => {
      if (!isActive) {
        return;
      }

      /*
       * Backend later:
       *
       * const response = await axiosInstance.get(
       *   "/notes/shared"
       * );
       *
       * const sharedNotes = response.data.data;
       *
       * setNotes(sharedNotes);
       */

      const mockNotes = [
        {
          id: "1",
          type: "shared",
          therapistName: "Dr. Sharma",
          title: "Session Follow-up",
          content:
            "We discussed the recent stressors and identified a few coping strategies to practice before the next session.",
          date: "16 August 2026",
          sessionDate: "16 August 2026",
        },
        {
          id: "2",
          type: "shared",
          therapistName: "Dr. Sharma",
          title: "Breathing Exercise",
          content:
            "Continue practicing the breathing exercise for a few minutes when you notice anxiety or feeling overwhelmed.",
          date: "12 August 2026",
          sessionDate: "12 August 2026",
        },
        {
          id: "3",
          type: "private",
          therapistName: "Dr. Sharma",
          title: "Private Clinical Note",
          content:
            "This note should never be visible to the client.",
          date: "12 August 2026",
          sessionDate: "12 August 2026",
        },
      ];

      /*
       * Safety layer:
       * Even demo data mein private note ko remove kar rahe hain.
       */
      const sharedOnly = mockNotes.filter(
        (note) => note.type === "shared",
      );

      setNotes(sharedOnly);
      setLoading(false);
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/client"
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
                Client Portal
              </p>
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Client Portal
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Shared Notes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Notes your therapist has chosen to share with you.
            </p>
          </div>

          {/* =================================================
              INFO
          ================================================== */}

          <section className="mt-7 rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Notes shared with you
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your therapist may share selected notes or
                  follow-up information with you after a session.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              NOTES
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
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

                <FileText
                  size={19}
                  className="text-violet-600"
                />
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <LoadingState />
              ) : notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <SharedNoteCard
                      key={note.id}
                      note={note}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          </section>

          {/* =================================================
              PRIVACY NOTE
          ================================================== */}

          <div className="mt-5 text-center text-[10px] text-slate-400">
            Only notes specifically shared by your therapist are
            visible here.
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <FileText size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {note.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <UserRound size={12} />
                {note.therapistName}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} />
                {note.sessionDate}
              </span>
            </div>
          </div>
        </div>

        <span className="self-start rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
          Shared with you
        </span>
      </div>

      {/* Content */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-600">
          {note.content}
        </p>
      </div>

      {/* Footer */}

      <div className="mt-4 text-[10px] text-slate-400">
        Shared on {note.date}
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
          className="animate-pulse rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-slate-200" />

              <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-5 h-20 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
        <FileText size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        No shared notes yet
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Notes shared by your therapist will appear here after
        they choose to share them with you.
      </p>
    </div>
  );
}

export default SharedNotes;