const Notes = require("../models/notes.model");

/* =========================================================
   Create Note
========================================================= */

const createNote = async (noteData) => {
  return await Notes.create(noteData);
};

/* =========================================================
   Find Note By ID
========================================================= */

const findNoteById = async (noteId) => {
  return await Notes.findById(noteId).lean();
};

/* =========================================================
   Find Notes By Session ID
========================================================= */

const findNotesBySessionId = async (sessionId) => {
  return await Notes.find({
    sessionId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

/* =========================================================
   Find Shared Notes By Client ID
   ---------------------------------------------------------
   IMPORTANT:
   Only SHARED notes are returned.
   PRIVATE notes client ko kabhi nahi milenge.
========================================================= */

const findSharedNotesByClientId = async (clientId) => {
  return await Notes.find({
    clientId,
    type: "SHARED",
  })
    .populate({
      path: "therapistId",
      select: "_id name slug specializations languages",
    })
    .populate({
      path: "sessionId",
      select: "_id date startTime endTime duration status paymentStatus",
    })
    .sort({
      createdAt: -1,
    })
    .lean();
};

/* =========================================================
   Update Note
========================================================= */

const updateNote = async (noteId, data) => {
  return await Notes.findByIdAndUpdate(noteId, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* =========================================================
   Delete Note
========================================================= */

const deleteNote = async (noteId) => {
  return await Notes.findByIdAndDelete(noteId);
};

/* =========================================================
   Exports
========================================================= */

module.exports = {
  createNote,
  findNoteById,
  findNotesBySessionId,
  findSharedNotesByClientId,
  updateNote,
  deleteNote,
};
