import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
     NOTE CREATION GUIDE STATE
  ========================================================= */

  const currentGuideStep = isEditorOpen
    ? 3
    : selectedSession
      ? 3
      : selectedClient
        ? 2
        : 1;

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
      toast.error("Please select a session first.", {
        id: "note-select-session",
      });
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
      toast.error("Please write something in the note.", {
        id: "note-empty-content",
      });
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

      toast.success(
        editingNote
          ? "Note updated successfully."
          : "Note created successfully.",
        {
          id: "note-save-success",
        },
      );
    } catch (error) {
      console.error("Failed to save note:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Failed to save note. Please try again.";

      setNotesError(errorMessage);

      toast.error(errorMessage, {
        id: "note-save-error",
      });
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

      toast.success("Note deleted successfully.", {
        id: "note-delete-success",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Failed to delete note. Please try again.";

      setNotesError(errorMessage);

      toast.error(errorMessage, {
        id: "note-delete-error",
      });
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
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-200/70 transition duration-300 hover:-translate-y-0.5">
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
            className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-2.5 text-xs font-bold text-slate-500 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="pointer-events-none fixed -left-36 top-20 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-24 h-[420px] w-[420px] rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-[36%] h-80 w-80 rounded-full bg-fuchsia-100/20 blur-3xl" />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                  Clinical Documentation
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[42px]">
                Session Notes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Follow the simple 3-step flow below: choose a client, pick a
                session, then add and save the note.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={!selectedSession || savingNote}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              New Note
            </button>
          </div>

          {!selectedSession && (
            <div className="mt-3 flex justify-end">
              <p className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm">
                {!selectedClient
                  ? "Start by selecting a client below."
                  : "Great — now select one of their sessions."}
              </p>
            </div>
          )}

          {/* =================================================
              QUICK START GUIDE
          ================================================== */}

          <section className="mt-6 overflow-hidden rounded-[26px] border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-indigo-50/70 p-5 shadow-[0_18px_55px_-35px_rgba(124,58,237,0.35)] sm:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">
                      Quick start
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-extrabold tracking-tight text-slate-900">
                    Create a session note in 3 simple steps
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    New here? Just follow the flow from left to right. Nothing
                    needs to be set up before you start.
                  </p>
                </div>

                <div className="rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-violet-700 shadow-sm">
                  Step {currentGuideStep} of 3
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <GuideStep
                  number="01"
                  title="Choose a client"
                  description="Click the client you want to document."
                  active={!selectedClient}
                  completed={Boolean(selectedClient)}
                />

                <GuideStep
                  number="02"
                  title="Select a session"
                  description="Pick the exact session where the note belongs."
                  active={Boolean(selectedClient) && !selectedSession}
                  completed={Boolean(selectedSession)}
                />

                <GuideStep
                  number="03"
                  title="Add & save note"
                  description="Click Add Note, choose privacy, write, then save."
                  active={Boolean(selectedSession)}
                  completed={sessionNotes.length > 0}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              PRIVACY INFO
          ================================================== */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PrivacyCard
              type="Private"
              description="Use this for your internal observations, assessments, and therapist-only documentation."
              icon={<ShieldCheck size={18} />}
              variant="private"
            />

            <PrivacyCard
              type="Shared"
              description="Use this for summaries, takeaways, or notes you intentionally want the selected client to see."
              icon={<UserRound size={18} />}
              variant="shared"
            />
          </div>

          {/* =================================================
              CLIENT SEARCH + CLIENT LIST
          ================================================== */}

          <section className="mt-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/15 to-indigo-50/25 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <UserRound size={16} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      Select Client
                    </h2>

                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-extrabold text-violet-700">
                      STEP 1
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Start here — click a client to unlock their sessions. Only
                    clients who have booked with you are shown.
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
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
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
                      className={`group rounded-2xl border p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected
                          ? "border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-md shadow-violet-100"
                          : "border-slate-200/90 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold shadow-sm transition ${
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
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isSelected ? "Client selected" : "Click to select"}
                        </span>

                        <div className="flex items-center gap-2">
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
            <section className="mt-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/15 to-indigo-50/25 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm ring-1 ring-violet-100">
                      <FileText size={19} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">
                          {selectedClient.name}'s Sessions
                        </h2>

                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-extrabold text-indigo-700">
                          STEP 2
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Now choose the exact session you want to document.
                        Selecting one will open the note area below.
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
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
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
                        className={`group rounded-2xl border p-4.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          isSelected
                            ? "border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-md shadow-violet-100"
                            : "border-slate-200/90 bg-white hover:border-violet-200 hover:bg-violet-50/40"
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

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {isSelected ? (
                                <span className="rounded-full bg-violet-100 px-2.5 py-1.5 text-[9px] font-bold text-violet-700">
                                  Session selected
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-violet-600">
                                  Click to use this session
                                </span>
                              )}

                              <SessionStatus status={session.status} />

                              {session.paymentStatus && (
                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-600 shadow-sm">
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
            <section className="mt-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur-sm">
              {/* Session Header */}

              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm ring-1 ring-violet-100">
                    <FileText size={19} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedSession.clientName}
                      </h2>

                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700">
                        STEP 3
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedSession.displayDate} •{" "}
                      {selectedSession.displayTime}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-violet-600">
                      Click <span className="font-extrabold">Add Note</span> to
                      start writing for this session.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Note Filter */}

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm outline-none transition hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="ALL">All Notes</option>

                    <option value="PRIVATE">Private</option>

                    <option value="SHARED">Shared</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    disabled={savingNote}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-3.5 text-xs font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 shadow-sm ring-8 ring-violet-50">
                        <FileText size={21} />
                      </div>

                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-violet-700">
                        Ready to document
                      </span>

                      <p className="mt-3 text-base font-extrabold tracking-tight text-slate-800">
                        No notes for this session yet
                      </p>

                      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                        This is where your session notes will appear. Start by
                        clicking{" "}
                        <span className="font-bold text-violet-600">
                          Add Note
                        </span>
                        , then choose whether the note is private or shared and
                        write your session summary.
                      </p>

                      <button
                        type="button"
                        onClick={handleOpenCreate}
                        disabled={savingNote}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 py-6 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/70 bg-white shadow-[0_30px_100px_-30px_rgba(15,23,42,0.45)]">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white via-violet-50/20 to-indigo-50/25 px-5 py-5 sm:px-6">
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
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Editor */}

            <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-indigo-50/70 px-5 py-3.5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <p className="text-[11px] font-extrabold text-slate-800">
                    One important choice before you save
                  </p>

                  <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
                    Choose{" "}
                    <span className="font-bold text-amber-600">Private</span>
                    for therapist-only documentation, or{" "}
                    <span className="font-bold text-emerald-600">Shared</span>
                    when you want the selected client to be able to see the
                    note.
                  </p>
                </div>
              </div>
            </div>

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
   GUIDED FLOW STEP
========================================================= */

function GuideStep({ number, title, description, active, completed }) {
  return (
    <div
      className={`relative rounded-2xl border p-4 transition ${
        completed
          ? "border-emerald-200 bg-emerald-50/80"
          : active
            ? "border-violet-300 bg-white shadow-md shadow-violet-100/60"
            : "border-slate-200 bg-white/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[10px] font-extrabold ${
            completed
              ? "bg-emerald-500 text-white"
              : active
                ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {completed ? <CheckCircle2 size={17} /> : number}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-extrabold text-slate-800">{title}</p>

            {active && !completed && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-violet-700">
                Start here
              </span>
            )}

            {completed && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                Done
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
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
      className={`rounded-[24px] border p-4.5 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.20)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isPrivate
          ? "border-amber-100 bg-gradient-to-r from-amber-50 via-white to-white"
          : "border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isPrivate
              ? "bg-amber-100 text-amber-700 shadow-sm"
              : "bg-emerald-100 text-emerald-700 shadow-sm"
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
    <div className="border-b border-slate-50 p-5 last:border-b-0">
      <div className="group rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 via-white to-white p-4.5 shadow-sm transition duration-200 hover:border-violet-100 hover:shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left */}

          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
                isPrivate
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {isPrivate ? <ShieldCheck size={16} /> : <UserRound size={16} />}
            </div>

            <div>
              <span
                className={`rounded-full border px-2.5 py-1.5 text-[10px] font-bold shadow-sm ${
                  isPrivate
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
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
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Edit note"
            >
              <Edit3 size={15} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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

  let className = "border border-slate-200 bg-slate-100 text-slate-500";

  if (normalizedStatus === "CONFIRMED") {
    className = "border border-emerald-100 bg-emerald-50 text-emerald-700";
  } else if (normalizedStatus === "PENDING") {
    className = "border border-amber-100 bg-amber-50 text-amber-700";
  } else if (normalizedStatus === "COMPLETED") {
    className = "border border-violet-100 bg-violet-50 text-violet-700";
  } else if (normalizedStatus === "CANCELLED") {
    className = "border border-red-100 bg-red-50 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1.5 text-[9px] font-bold shadow-sm ${className}`}
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
