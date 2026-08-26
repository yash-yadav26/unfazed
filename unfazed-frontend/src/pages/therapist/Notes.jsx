import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Edit3,
  FileText,
  HeartHandshake,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import NoteEditor from "../../components/notes/NoteEditor";

/* =========================================================
   MOCK SESSIONS
   Backend se later GET /sessions?clientId=... se aayenge
========================================================= */

const initialSessions = [
  {
    id: "session-1",
    clientId: "client-1",
    clientName: "Ananya Sharma",
    clientEmail: "ananya@example.com",
    date: "16 Aug 2026",
    time: "10:00 AM",
    type: "Individual Therapy",
  },
  {
    id: "session-2",
    clientId: "client-2",
    clientName: "Rahul Mehta",
    clientEmail: "rahul@example.com",
    date: "15 Aug 2026",
    time: "11:30 AM",
    type: "Anxiety Support",
  },
  {
    id: "session-3",
    clientId: "client-3",
    clientName: "Priya Singh",
    clientEmail: "priya@example.com",
    date: "14 Aug 2026",
    time: "02:00 PM",
    type: "Relationship Counseling",
  },
  {
    id: "session-4",
    clientId: "client-4",
    clientName: "Arjun Verma",
    clientEmail: "arjun@example.com",
    date: "12 Aug 2026",
    time: "04:30 PM",
    type: "Individual Therapy",
  },
  {
    id: "session-5",
    clientId: "client-1",
    clientName: "Ananya Sharma",
    clientEmail: "ananya@example.com",
    date: "10 Aug 2026",
    time: "10:00 AM",
    type: "Individual Therapy",
  },
  {
    id: "session-6",
    clientId: "client-1",
    clientName: "Ananya Sharma",
    clientEmail: "ananya@example.com",
    date: "05 Aug 2026",
    time: "10:00 AM",
    type: "Anxiety Support",
  },
  {
    id: "session-7",
    clientId: "client-2",
    clientName: "Rahul Mehta",
    clientEmail: "rahul@example.com",
    date: "08 Aug 2026",
    time: "11:30 AM",
    type: "Anxiety Support",
  },
];

/* =========================================================
   MOCK NOTES
========================================================= */

const initialNotes = [
  {
    id: "note-1",
    sessionId: "session-1",
    clientId: "client-1",
    clientName: "Ananya Sharma",
    date: "16 Aug 2026",
    time: "10:00 AM",
    type: "PRIVATE",
    content:
      "Discussed current stressors and coping strategies. Therapist observation recorded for future sessions.",
  },
  {
    id: "note-2",
    sessionId: "session-1",
    clientId: "client-1",
    clientName: "Ananya Sharma",
    date: "16 Aug 2026",
    time: "10:00 AM",
    type: "SHARED",
    content:
      "Session summary: discussed stress management techniques and practical coping strategies.",
  },
  {
    id: "note-3",
    sessionId: "session-5",
    clientId: "client-1",
    clientName: "Ananya Sharma",
    date: "10 Aug 2026",
    time: "10:00 AM",
    type: "SHARED",
    content:
      "Discussed anxiety triggers and practiced a simple breathing exercise.",
  },
  {
    id: "note-4",
    sessionId: "session-2",
    clientId: "client-2",
    clientName: "Rahul Mehta",
    date: "15 Aug 2026",
    time: "11:30 AM",
    type: "SHARED",
    content:
      "Worked on identifying anxious thoughts and introduced a breathing exercise.",
  },
];

/* =========================================================
   NOTES PAGE
========================================================= */

function Notes() {
  const [sessions] = useState(initialSessions);
  const [notes, setNotes] = useState(initialNotes);

  /* ---------------------------------------------------------
     CLIENT SEARCH
  --------------------------------------------------------- */

  const [clientSearch, setClientSearch] = useState("");

  /* ---------------------------------------------------------
     SELECTED CLIENT
  --------------------------------------------------------- */

  const [selectedClientId, setSelectedClientId] = useState("");

  /* ---------------------------------------------------------
     SESSION SEARCH
  --------------------------------------------------------- */

  const [sessionSearch, setSessionSearch] = useState("");

  /* ---------------------------------------------------------
     SELECTED SESSION
  --------------------------------------------------------- */

  const [selectedSessionId, setSelectedSessionId] = useState("");

  /* ---------------------------------------------------------
     NOTE FILTER
  --------------------------------------------------------- */

  const [typeFilter, setTypeFilter] = useState("ALL");

  /* ---------------------------------------------------------
     NOTE EDITOR
  --------------------------------------------------------- */

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  /* =========================================================
     UNIQUE CLIENTS
  ========================================================= */

  const clients = useMemo(() => {
    const map = new Map();

    sessions.forEach((session) => {
      if (!map.has(session.clientId)) {
        map.set(session.clientId, {
          id: session.clientId,
          name: session.clientName,
          email: session.clientEmail,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [sessions]);

  /* =========================================================
     SEARCHED CLIENTS
  ========================================================= */

  const filteredClients = useMemo(() => {
    const value = clientSearch.trim().toLowerCase();

    if (!value) {
      return clients;
    }

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(value) ||
        client.email.toLowerCase().includes(value),
    );
  }, [clients, clientSearch]);

  /* =========================================================
     SELECTED CLIENT
  ========================================================= */

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId,
  );

  /* =========================================================
     CLIENT SESSIONS
  ========================================================= */

  const clientSessions = useMemo(() => {
    if (!selectedClientId) {
      return [];
    }

    return sessions
      .filter((session) => session.clientId === selectedClientId)
      .filter((session) => {
        const value = sessionSearch.trim().toLowerCase();

        if (!value) {
          return true;
        }

        return (
          session.date.toLowerCase().includes(value) ||
          session.time.toLowerCase().includes(value) ||
          session.type.toLowerCase().includes(value)
        );
      });
  }, [sessions, selectedClientId, sessionSearch]);

  /* =========================================================
     SELECTED SESSION
  ========================================================= */

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );

  /* =========================================================
     SELECT CLIENT
  ========================================================= */

  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);

    // New client select hone par previous session clear.
    setSelectedSessionId("");

    // Session search bhi reset.
    setSessionSearch("");

    // Existing editor close kar do.
    setEditingNote(null);
    setIsEditorOpen(false);
  };

  /* =========================================================
     SELECT SESSION
  ========================================================= */

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);

    setEditingNote(null);
    setIsEditorOpen(false);
  };

  /* =========================================================
     NEW NOTE
  ========================================================= */

  const handleOpenCreate = () => {
    if (!selectedSession) {
      alert("Please select a session first.");
      return;
    }

    setEditingNote(null);
    setIsEditorOpen(true);
  };

  /* =========================================================
     EDIT NOTE
  ========================================================= */

  const handleEdit = (note) => {
    setEditingNote(note);

    // Safety: note ka client/session automatically select
    // ho jayega.
    setSelectedClientId(note.clientId);
    setSelectedSessionId(note.sessionId);

    setIsEditorOpen(true);
  };

  /* =========================================================
     SAVE NOTE
  ========================================================= */

  const handleSaveNote = ({ type, content }) => {
    if (!selectedSession) {
      return;
    }

    if (!content.trim()) {
      alert("Please write something in the note.");
      return;
    }

    /* -------------------------------------------------------
       EDIT EXISTING NOTE
    ------------------------------------------------------- */

    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        type,
        content,
      };

      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingNote.id ? updatedNote : note,
        ),
      );

      // Backend later:
      // PATCH /notes/:id

      console.log("PATCH /notes/:id", {
        noteId: editingNote.id,
        payload: {
          type,
          content,
        },
      });
    }

    /* -------------------------------------------------------
       CREATE NEW NOTE
    ------------------------------------------------------- */

    else {
      const newNote = {
        id: `note-${Date.now()}`,
        sessionId: selectedSession.id,
        clientId: selectedSession.clientId,
        clientName: selectedSession.clientName,
        date: selectedSession.date,
        time: selectedSession.time,
        type,
        content,
      };

      setNotes((prev) => [newNote, ...prev]);

      // Backend later:
      // POST /notes

      console.log("POST /notes", {
        sessionId: selectedSession.id,
        type,
        content,
      });
    }

    setEditingNote(null);
    setIsEditorOpen(false);
  };

  /* =========================================================
     DELETE NOTE
  ========================================================= */

  const handleDelete = (note) => {
    const confirmed = window.confirm(
      `Delete this ${note.type.toLowerCase()} note?`,
    );

    if (!confirmed) {
      return;
    }

    setNotes((prev) =>
      prev.filter((item) => item.id !== note.id),
    );

    // Backend later:
    // DELETE /notes/:id

    console.log("DELETE /notes/:id", {
      noteId: note.id,
    });
  };

  /* =========================================================
     NOTES FOR SELECTED SESSION
  ========================================================= */

  const sessionNotes = useMemo(() => {
    if (!selectedSessionId) {
      return [];
    }

    return notes.filter((note) => {
      const matchesSession =
        note.sessionId === selectedSessionId;

      const matchesType =
        typeFilter === "ALL" ||
        note.type === typeFilter;

      return matchesSession && matchesType;
    });
  }, [notes, selectedSessionId, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

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

          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                Clinical Documentation
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Session Notes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Find a client, select their session, and manage the notes
                for that specific session.
              </p>

            </div>


            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              <Plus size={16} />
              New Note
            </button>

          </div>


          {/* =================================================
              PRIVACY INFO
          ================================================== */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <PrivacyCard
              type="Private"
              description="Only you can access these notes."
              icon={<ShieldCheck size={18} />}
              variant="private"
            />

            <PrivacyCard
              type="Shared"
              description="These notes can be shown to the selected client."
              icon={<UserRound size={18} />}
              variant="shared"
            />

          </div>


          {/* =================================================
              CLIENT SEARCH + CLIENT LIST
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-100 p-5">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <UserRound size={16} />
                </div>

                <div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Select Client
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Search the client whose session notes you want to manage.
                  </p>

                </div>

              </div>


              {/* Search */}
              <div className="relative mt-4 max-w-xl">

                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);

                    // Search karte waqt selected client reset.
                    if (selectedClientId) {
                      setSelectedClientId("");
                      setSelectedSessionId("");
                    }
                  }}
                  placeholder="Search client by name or email..."
                  className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />

              </div>

            </div>


            {/* Client Results */}
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredClients.length > 0 ? (

                filteredClients.map((client) => {

                  const isSelected =
                    selectedClientId === client.id;

                  const clientSessionCount =
                    sessions.filter(
                      (session) =>
                        session.clientId === client.id,
                    ).length;

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() =>
                        handleSelectClient(client.id)
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-violet-300 bg-violet-50"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected
                              ? "bg-violet-600 text-white"
                              : "bg-violet-100 text-violet-700"
                          }`}
                        >
                          {getInitials(client.name)}
                        </div>


                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {client.name}
                          </p>

                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {client.email}
                          </p>

                        </div>


                        {isSelected && (
                          <CheckCircle2
                            size={17}
                            className="shrink-0 text-violet-600"
                          />
                        )}

                      </div>


                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-[10px] font-medium text-slate-400">
                          {clientSessionCount}{" "}
                          {clientSessionCount === 1
                            ? "session"
                            : "sessions"}
                        </span>

                        <ChevronDown
                          size={14}
                          className={`text-slate-300 transition ${
                            isSelected
                              ? "rotate-180 text-violet-500"
                              : ""
                          }`}
                        />

                      </div>

                    </button>
                  );
                })

              ) : (

                <div className="col-span-full py-10 text-center">

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Search size={19} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No client found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another client name or email.
                  </p>

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              SESSION SECTION
          ================================================== */}

          {selectedClient && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white">

              <div className="border-b border-slate-100 p-5">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <FileText size={19} />
                    </div>

                    <div>

                      <h2 className="text-sm font-bold text-slate-900">
                        {selectedClient.name}'s Sessions
                      </h2>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Select a session to view or create notes.
                      </p>

                    </div>

                  </div>


                  {/* Session Search */}
                  <div className="relative w-full lg:max-w-sm">

                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={sessionSearch}
                      onChange={(e) =>
                        setSessionSearch(e.target.value)
                      }
                      placeholder="Search session..."
                      className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-xs outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />

                  </div>

                </div>

              </div>


              {/* Session List */}
              <div className="grid gap-3 p-5 sm:grid-cols-2">

                {clientSessions.length > 0 ? (

                  clientSessions.map((session) => {

                    const isSelected =
                      selectedSessionId === session.id;

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() =>
                          handleSelectSession(session.id)
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-violet-300 bg-violet-50"
                            : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <p className="text-sm font-semibold text-slate-800">
                              {session.date}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {session.time}
                            </p>

                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                              {session.type}
                            </p>

                          </div>


                          {isSelected && (
                            <CheckCircle2
                              size={17}
                              className="text-violet-600"
                            />
                          )}

                        </div>

                      </button>
                    );
                  })

                ) : (

                  <div className="col-span-full py-10 text-center">

                    <p className="text-sm font-semibold text-slate-700">
                      No sessions found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another session search.
                    </p>

                  </div>

                )}

              </div>

            </section>
          )}


          {/* =================================================
              SELECTED SESSION NOTES
          ================================================== */}

          {selectedSession && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white">

              {/* Session Header */}
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileText size={19} />
                  </div>

                  <div>

                    <h2 className="text-base font-bold text-slate-900">
                      {selectedSession.clientName}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedSession.date} •{" "}
                      {selectedSession.time} •{" "}
                      {selectedSession.type}
                    </p>

                  </div>

                </div>


                <div className="flex flex-wrap items-center gap-2">

                  {/* Note filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value)
                    }
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-500"
                  >
                    <option value="ALL">
                      All Notes
                    </option>

                    <option value="PRIVATE">
                      Private
                    </option>

                    <option value="SHARED">
                      Shared
                    </option>
                  </select>


                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    <Plus size={14} />
                    Add Note
                  </button>

                </div>

              </div>


              {/* Notes */}
              <div className="divide-y divide-slate-100">

                {sessionNotes.length > 0 ? (

                  sessionNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => handleEdit(note)}
                      onDelete={() => handleDelete(note)}
                    />
                  ))

                ) : (

                  <div className="px-5 py-14 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <FileText size={21} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      No notes for this session
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a note to document this session.
                    </p>

                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white"
                    >
                      <Plus size={14} />
                      Create Note
                    </button>

                  </div>

                )}

              </div>

            </section>
          )}


          {/* Bottom privacy note */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">

            <ShieldCheck size={14} />

            <span>
              Private notes are restricted to authorized therapists.
            </span>

          </div>

        </div>
      </main>


      {/* =====================================================
          NOTE EDITOR MODAL
      ====================================================== */}

      {isEditorOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-5 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                  {editingNote ? "Edit Note" : "New Note"}
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedSession.clientName}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedSession.date} •{" "}
                  {selectedSession.time}
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setEditingNote(null);
                  setIsEditorOpen(false);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

            </div>


            {/* Editor */}
            <div className="p-5 sm:p-6">

              <NoteEditor
                initialNote={editingNote}
                onSave={handleSaveNote}
                onCancel={() => {
                  setEditingNote(null);
                  setIsEditorOpen(false);
                }}
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   PRIVACY CARD
========================================================= */

function PrivacyCard({
  type,
  description,
  icon,
  variant,
}) {
  const isPrivate = variant === "private";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isPrivate
          ? "border-amber-100 bg-amber-50/70"
          : "border-emerald-100 bg-emerald-50/70"
      }`}
    >

      <div className="flex items-start gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isPrivate
              ? "bg-amber-100 text-amber-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm font-bold text-slate-800">
            {type} Note
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   NOTE CARD
========================================================= */

function NoteCard({
  note,
  onEdit,
  onDelete,
}) {
  const isPrivate = note.type === "PRIVATE";

  return (
    <div className="p-5">

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

          {/* Left */}
          <div className="flex items-center gap-3">

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isPrivate
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isPrivate ? (
                <ShieldCheck size={16} />
              ) : (
                <UserRound size={16} />
              )}
            </div>


            <div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  isPrivate
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isPrivate ? "Private" : "Shared"}
              </span>

              <p className="mt-1 text-[10px] text-slate-400">
                {note.date} • {note.time}
              </p>

            </div>

          </div>


          {/* Actions */}
          <div className="flex items-center gap-1">

            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
              aria-label="Edit note"
            >
              <Edit3 size={15} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Delete note"
            >
              <Trash2 size={15} />
            </button>

          </div>

        </div>


        {/* Note content */}
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {note.content}
        </p>

      </div>

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

export default Notes;