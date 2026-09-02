const notesRepository = require("../repositories/notes.repository");

const User = require("../../auth/models/user.model");

const Therapist = require("../../therapist/models/therapist.model");

const Client = require("../../client/models/client.model");

const Session = require("../../session/models/session.model");

const notificationService = require("../../notification/services/notification.service");

const ApiError = require("../../../utils/apiError");

/* =========================================================
   Get Therapist Profile
   ---------------------------------------------------------
   Logged-in User -> Therapist profile
========================================================= */

const getTherapist = async (userId) => {
  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  if (user.role !== "THERAPIST") {
    throw new ApiError(
      403,
      "Only therapists can manage session notes.",
      "THERAPIST_ONLY",
    );
  }

  const therapist = await Therapist.findOne({
    userId,
  }).select("_id");

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "THERAPIST_PROFILE_NOT_FOUND",
    );
  }

  return therapist;
};

/* =========================================================
   Get Client Profile
   ---------------------------------------------------------
   Logged-in User -> Client profile
========================================================= */

const getClient = async (userId) => {
  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  if (user.role !== "CLIENT") {
    throw new ApiError(
      403,
      "Only clients can access shared notes.",
      "CLIENT_ONLY",
    );
  }

  const client = await Client.findOne({
    userId,
  }).select("_id");

  if (!client) {
    throw new ApiError(
      404,
      "Client profile not found.",
      "CLIENT_PROFILE_NOT_FOUND",
    );
  }

  return client;
};

/* =========================================================
   Get Therapist Session
   ---------------------------------------------------------
   Session must belong to logged-in therapist
========================================================= */

const getTherapistSession = async (sessionId, therapistId) => {
  const session = await Session.findOne({
    _id: sessionId,
    therapistId,
  }).select("_id clientId therapistId date startTime endTime duration status");

  if (!session) {
    throw new ApiError(
      404,
      "Session not found or does not belong to you.",
      "SESSION_NOT_FOUND",
    );
  }

  return session;
};

/* =========================================================
   Create Note
========================================================= */

const createNote = async (userId, data) => {
  /*
   * Logged-in user therapist hona chahiye.
   */
  const therapist = await getTherapist(userId);

  /*
   * Session bhi isi therapist ka hona chahiye.
   */
  const session = await getTherapistSession(data.sessionId, therapist._id);

  /*
   * clientId frontend se nahi liya.
   *
   * Session se directly derive kiya.
   */
  const note = await notesRepository.createNote({
    sessionId: session._id,
    therapistId: therapist._id,
    clientId: session.clientId,
    type: data.type,
    content: data.content,
  });

  /* ------------------------------------------------------------------------ */
  /*                         Shared Note Notification                         */
  /* ------------------------------------------------------------------------ */

  /*
   * PRIVATE note par notification nahi jayegi.
   *
   * Sirf SHARED note hone par client ko notification milegi.
   */
  if (data.type === "SHARED") {
    const client = await Client.findById(session.clientId).select("userId");

    if (!client) {
      throw new ApiError(
        404,
        "Client profile not found.",
        "CLIENT_PROFILE_NOT_FOUND",
      );
    }

    await notificationService.createNotification({
      recipientId: client.userId,
      type: "NOTE_SHARED",
      title: "New Session Note",
      message: "Your therapist has shared a note with you.",
      sessionId: session._id,
      noteId: note._id,
    });
  }

  return note;
};

/* =========================================================
   Get Notes For Therapist Session
========================================================= */

const getSessionNotes = async (userId, sessionId) => {
  const therapist = await getTherapist(userId);

  /*
   * Ensure session belongs to therapist.
   */
  await getTherapistSession(sessionId, therapist._id);

  return await notesRepository.findNotesBySessionId(sessionId);
};

/* =========================================================
   Get Shared Notes For Client
   ---------------------------------------------------------
   PRIVATE notes NEVER returned.
========================================================= */

const getMySharedNotes = async (userId) => {
  const client = await getClient(userId);

  /*
   * Repository itself filters:
   *
   * type: "SHARED"
   *
   * So private notes are not returned.
   */
  return await notesRepository.findSharedNotesByClientId(client._id);
};

/* =========================================================
   Update Note
========================================================= */

const updateNote = async (userId, noteId, data) => {
  const therapist = await getTherapist(userId);

  const note = await notesRepository.findNoteById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found.", "NOTE_NOT_FOUND");
  }

  /*
   * Sirf note ka original therapist
   * usko update kar sakta hai.
   */
  if (String(note.therapistId) !== String(therapist._id)) {
    throw new ApiError(
      403,
      "You are not allowed to modify this note.",
      "NOTE_ACCESS_DENIED",
    );
  }

  const updatedNote = await notesRepository.updateNote(noteId, data);

  return updatedNote;
};

/* =========================================================
   Delete Note
========================================================= */

const deleteNote = async (userId, noteId) => {
  const therapist = await getTherapist(userId);

  const note = await notesRepository.findNoteById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found.", "NOTE_NOT_FOUND");
  }

  /*
   * Sirf note ka original therapist
   * delete kar sakta hai.
   */
  if (String(note.therapistId) !== String(therapist._id)) {
    throw new ApiError(
      403,
      "You are not allowed to delete this note.",
      "NOTE_ACCESS_DENIED",
    );
  }

  await notesRepository.deleteNote(noteId);

  return {
    id: noteId,
  };
};

/* =========================================================
   Exports
========================================================= */

module.exports = {
  createNote,
  getSessionNotes,
  getMySharedNotes,
  updateNote,
  deleteNote,
};
