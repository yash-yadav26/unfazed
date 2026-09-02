import { useEffect, useMemo, useState } from "react";
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

import {
  createNote,
  getSessionNotes,
  updateNote,
  deleteNote,
} from "../../api/notesApi";

import { getMyClients } from "../../api/clientApi";

/* =========================================================
   NOTES PAGE
========================================================= */

function Notes() {
  /* =========================================================
     CLIENTS FROM BACKEND
  ========================================================= */

  const [clients, setClients] = useState([]);

  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState("");

  /* =========================================================
     NOTES FROM BACKEND
  ========================================================= */

  const [notes, setNotes] = useState([]);

  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");

  /* =========================================================
     CLIENT SEARCH
  ========================================================= */

  const [clientSearch, setClientSearch] = useState("");

  /* =========================================================
     SELECTED CLIENT
  ========================================================= */

  const [selectedClientId, setSelectedClientId] = useState("");

  /* =========================================================
     SESSION SEARCH
  ========================================================= */

  const [sessionSearch, setSessionSearch] = useState("");

  /* =========================================================
     SELECTED SESSION
  ========================================================= */

  const [selectedSessionId, setSelectedSessionId] = useState("");

  /* =========================================================
     NOTE FILTER
  ========================================================= */

  const [typeFilter, setTypeFilter] = useState("ALL");

  /* =========================================================
     NOTE EDITOR
  ========================================================= */

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  /* =========================================================
     NOTE ACTION LOADING
  ========================================================= */

  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  /* =========================================================
     FETCH MY CLIENTS
  ========================================================= */

  useEffect(() => {
    const fetchMyClients = async () => {
      try {
        setClientsLoading(true);
        setClientsError("");

        const response = await getMyClients();

        const clientData = Array.isArray(response?.data) ? response.data : [];

        setClients(clientData);
      } catch (error) {
        console.error("Failed to fetch therapist clients:", error);

        setClientsError(
          error?.response?.data?.message ||
            "Failed to load clients. Please try again.",
        );
      } finally {
        setClientsLoading(false);
      }
    };

    fetchMyClients();
  }, []);

  /* =========================================================
     SEARCHED CLIENTS
  ========================================================= */

  const filteredClients = useMemo(() => {
    const value = clientSearch.trim().toLowerCase();

    if (!value) {
      return clients;
    }

    return clients.filter((client) => {
      const name = String(client?.name || "").toLowerCase();

      const email = String(client?.email || "").toLowerCase();

      const phone = String(client?.phone || "").toLowerCase();

      return (
        name.includes(value) || email.includes(value) || phone.includes(value)
      );
    });
  }, [clients, clientSearch]);

  /* =========================================================
     SELECTED CLIENT
  ========================================================= */

  const selectedClient = clients.find(
    (client) => String(client?._id) === String(selectedClientId),
  );

  /* =========================================================
     CLIENT SESSIONS
     ---------------------------------------------------------
     Sessions already backend se getMyClients()
     response ke andar aa rahi hain.
  ========================================================= */

  const clientSessions = useMemo(() => {
    if (!selectedClient) {
      return [];
    }

    const sessions = Array.isArray(selectedClient.sessions)
      ? selectedClient.sessions
      : [];

    const searchValue = sessionSearch.trim().toLowerCase();

    const normalizedSessions = sessions.map((session) => ({
      ...session,

      id: String(session?._id),

      clientId: selectedClient._id,
      clientName: selectedClient.name,
      clientEmail: selectedClient.email,

      displayDate: formatSessionDate(session?.date),

      displayTime: formatSessionTime(session?.startTime, session?.endTime),
    }));

    if (!searchValue) {
      return normalizedSessions;
    }

    return normalizedSessions.filter((session) => {
      const date = String(session?.displayDate || "").toLowerCase();

      const time = String(session?.displayTime || "").toLowerCase();

      const status = String(session?.status || "").toLowerCase();

      const paymentStatus = String(session?.paymentStatus || "").toLowerCase();

      return (
        date.includes(searchValue) ||
        time.includes(searchValue) ||
        status.includes(searchValue) ||
        paymentStatus.includes(searchValue)
      );
    });
  }, [selectedClient, sessionSearch]);

  /* =========================================================
     SELECTED SESSION
  ========================================================= */

  const selectedSession = clientSessions.find(
    (session) => String(session?.id) === String(selectedSessionId),
  );

  /* =========================================================
     FETCH NOTES FOR SELECTED SESSION
     ---------------------------------------------------------
     GET /api/notes/session/:sessionId
  ========================================================= */

  useEffect(() => {
    if (!selectedSessionId || !selectedSession) {
      return;
    }

    const fetchSessionNotes = async () => {
      try {
        setNotesLoading(true);
        setNotesError("");

        const response = await getSessionNotes(selectedSessionId);

        const noteData = Array.isArray(response?.data) ? response.data : [];

        /*
         * Backend note mein session ki date/time
         * directly nahi hai.
         *
         * Isliye selected session ki date/time
         * UI ke liye attach kar rahe hain.
         */

        const normalizedNotes = noteData.map((note) => ({
          ...note,

          id: String(note?._id),

          sessionId: String(note?.sessionId),

          clientId: String(selectedClient?._id),

          clientName: selectedClient?.name || "",

          date: selectedSession?.displayDate || "",

          time: selectedSession?.displayTime || "",
        }));

        setNotes(normalizedNotes);
      } catch (error) {
        console.error("Failed to fetch session notes:", error);

        setNotesError(
          error?.response?.data?.message || "Failed to load session notes.",
        );

        setNotes([]);
      } finally {
        setNotesLoading(false);
      }
    };

    fetchSessionNotes();
  }, [selectedSessionId, selectedSession, selectedClient]);

  /* =========================================================
     REFRESH SESSION NOTES
  ========================================================= */

  const refreshSessionNotes = async () => {
    if (!selectedSessionId || !selectedSession) {
      return;
    }

    try {
      setNotesLoading(true);
      setNotesError("");

      const response = await getSessionNotes(selectedSessionId);

      const noteData = Array.isArray(response?.data) ? response.data : [];

      const normalizedNotes = noteData.map((note) => ({
        ...note,

        id: String(note?._id),

        sessionId: String(note?.sessionId),

        clientId: String(selectedClient?._id),

        clientName: selectedClient?.name || "",

        date: selectedSession?.displayDate || "",

        time: selectedSession?.displayTime || "",
      }));

      setNotes(normalizedNotes);
    } catch (error) {
      console.error("Failed to refresh notes:", error);

      setNotesError(
        error?.response?.data?.message || "Failed to refresh notes.",
      );
    } finally {
      setNotesLoading(false);
    }
  };

  /* =========================================================
     SELECT CLIENT
  ========================================================= */

  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);

    setSelectedSessionId("");

    setSessionSearch("");

    setNotes([]);

    setNotesError("");

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
    setIsEditorOpen(true);
  };

  /* =========================================================
     SAVE NOTE
     ---------------------------------------------------------
     CREATE -> POST /api/notes
     UPDATE -> PATCH /api/notes/:id
  ========================================================= */

  const handleSaveNote = async ({ type, content }) => {
    if (!selectedSession) {
      return;
    }

    if (!content?.trim()) {
      alert("Please write something in the note.");
      return;
    }

    try {
      setSavingNote(true);
      setNotesError("");

      /* -----------------------------------------------------
         UPDATE EXISTING NOTE
      ----------------------------------------------------- */

      if (editingNote) {
        await updateNote(editingNote.id, {
          type,
          content,
        });
      } else {

      /* -----------------------------------------------------
         CREATE NEW NOTE
      ----------------------------------------------------- */
        await createNote({
          sessionId: selectedSession.id,
          type,
          content,
        });
      }

      /*
       * Save successfully hone ke baad
       * backend se latest notes dobara fetch.
       */

      await refreshSessionNotes();

      setEditingNote(null);
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Failed to save note:", error);

      setNotesError(
        error?.response?.data?.message ||
          "Failed to save note. Please try again.",
      );
    } finally {
      setSavingNote(false);
    }
  };

  /* =========================================================
     DELETE NOTE
     ---------------------------------------------------------
     DELETE /api/notes/:id
  ========================================================= */

  const handleDelete = async (note) => {
    const confirmed = window.confirm(
      `Delete this ${String(note?.type || "").toLowerCase()} note?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingNoteId(note.id);
      setNotesError("");

      await deleteNote(note.id);

      /*
       * Delete ke baad latest notes fetch.
       */
      await refreshSessionNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);

      setNotesError(
        error?.response?.data?.message ||
          "Failed to delete note. Please try again.",
      );
    } finally {
      setDeletingNoteId(null);
    }
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
        String(note?.sessionId) === String(selectedSessionId);

      const matchesType = typeFilter === "ALL" || note?.type === typeFilter;

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
                Find a client, select their session, and manage the notes for
                that specific session.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={!selectedSession || savingNote}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    Only clients who have booked a session with you are shown
                    here.
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

                    setSelectedClientId("");
                    setSelectedSessionId("");
                    setSessionSearch("");
                    setNotes([]);
                  }}
                  placeholder="Search client by name, email or phone..."
                  className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* =================================================
                CLIENT RESULTS
            ================================================== */}

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Loading */}

              {clientsLoading && (
                <div className="col-span-full py-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Loading clients...
                  </p>
                </div>
              )}

              {/* Error */}

              {!clientsLoading && clientsError && (
                <div className="col-span-full py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <UserRound size={19} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Unable to load clients
                  </p>

                  <p className="mt-1 text-xs text-red-500">{clientsError}</p>
                </div>
              )}

              {/* Client List */}

              {!clientsLoading &&
                !clientsError &&
                filteredClients.length > 0 &&
                filteredClients.map((client) => {
                  const isSelected =
                    String(selectedClientId) === String(client?._id);

                  const clientSessionCount = Array.isArray(client?.sessions)
                    ? client.sessions.length
                    : Number(client?.sessionsCount || 0);

                  return (
                    <button
                      key={client?._id}
                      type="button"
                      onClick={() => handleSelectClient(client?._id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-violet-300 bg-violet-50"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected
                              ? "bg-violet-600 text-white"
                              : "bg-violet-100 text-violet-700"
                          }`}
                        >
                          {getInitials(client?.name || "Client")}
                        </div>

                        {/* Client Info */}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {client?.name || "Unknown Client"}
                          </p>

                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {client?.email || "Email not available"}
                          </p>

                          {client?.phone && (
                            <p className="mt-0.5 truncate text-[10px] text-slate-400">
                              {client.phone}
                            </p>
                          )}
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
                          {clientSessionCount === 1 ? "session" : "sessions"}
                        </span>

                        <ChevronDown
                          size={14}
                          className={`text-slate-300 transition ${
                            isSelected ? "rotate-180 text-violet-500" : ""
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}

              {/* No Client */}

              {!clientsLoading &&
                !clientsError &&
                filteredClients.length === 0 && (
                  <div className="col-span-full py-10 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Search size={19} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No client found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {clientSearch
                        ? "Try another client name, email or phone."
                        : "No client has booked a session with you yet."}
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
                      onChange={(e) => setSessionSearch(e.target.value)}
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
                      String(selectedSessionId) === String(session.id);

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => handleSelectSession(session.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-violet-300 bg-violet-50"
                            : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                              {session.displayDate}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {session.displayTime}
                            </p>

                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                              {session.duration
                                ? `${session.duration} minutes`
                                : "Therapy Session"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <SessionStatus status={session.status} />

                              {session.paymentStatus && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">
                                  Payment: {formatStatus(session.paymentStatus)}
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2
                              size={17}
                              className="shrink-0 text-violet-600"
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
                      {sessionSearch
                        ? "Try another session search."
                        : "This client has no sessions yet."}
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
                      {selectedSession.displayDate} •{" "}
                      {selectedSession.displayTime}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Note Filter */}

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-500"
                  >
                    <option value="ALL">All Notes</option>

                    <option value="PRIVATE">Private</option>

                    <option value="SHARED">Shared</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    disabled={savingNote}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Add Note
                  </button>
                </div>
              </div>

              {/* =================================================
                  NOTES LOADING
              ================================================== */}

              {notesLoading && (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

                  <p className="mt-3 text-xs font-medium text-slate-500">
                    Loading notes...
                  </p>
                </div>
              )}

              {/* =================================================
                  NOTES ERROR
              ================================================== */}

              {!notesLoading && notesError && (
                <div className="border-b border-red-100 bg-red-50 px-5 py-3">
                  <p className="text-xs text-red-600">{notesError}</p>
                </div>
              )}

              {/* =================================================
                  NOTES
              ================================================== */}

              {!notesLoading && (
                <div className="divide-y divide-slate-100">
                  {sessionNotes.length > 0 ? (
                    sessionNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        deleting={deletingNoteId === note.id}
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
                        disabled={savingNote}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={14} />
                        Create Note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Bottom privacy note */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} />

            <span>Private notes are restricted to authorized therapists.</span>
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
                  {selectedSession.displayDate} • {selectedSession.displayTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (savingNote) {
                    return;
                  }

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
                  if (savingNote) {
                    return;
                  }

                  setEditingNote(null);
                  setIsEditorOpen(false);
                }}
              />

              {savingNote && (
                <p className="mt-3 text-center text-xs font-medium text-violet-600">
                  Saving note...
                </p>
              )}
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

function PrivacyCard({ type, description, icon, variant }) {
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
          <p className="text-sm font-bold text-slate-800">{type} Note</p>

          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NOTE CARD
========================================================= */

function NoteCard({ note, onEdit, onDelete, deleting }) {
  const isPrivate = note?.type === "PRIVATE";

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
              {isPrivate ? <ShieldCheck size={16} /> : <UserRound size={16} />}
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
                {note?.date || "Date unavailable"} •{" "}
                {note?.time || "Time unavailable"}
              </p>
            </div>
          </div>

          {/* Actions */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              disabled={deleting}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Edit note"
            >
              <Edit3 size={15} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Delete note"
            >
              {deleting ? (
                <div className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>
        </div>

        {/* Note content */}

        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {note?.content}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SESSION STATUS
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
   FORMAT SESSION DATE
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
   FORMAT SESSION TIME
========================================================= */

function formatSessionTime(startTime, endTime) {
  if (!startTime && !endTime) {
    return "Time unavailable";
  }

  if (!endTime) {
    return startTime;
  }

  return `${startTime} - ${endTime}`;
}

/* =========================================================
   FORMAT STATUS
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
   GET INITIALS
========================================================= */

function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default Notes;
