const notesService = require("../services/notes.service");

const ApiResponse = require("../../../utils/apiResponse");

const asyncHandler = require("../../../utils/asyncHandler");

/* =========================================================
   Create Note
========================================================= */

const createNoteController = asyncHandler(async (req, res) => {
  const result = await notesService.createNote(req.user.id, req.validatedBody);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Session note created successfully."));
});

/* =========================================================
   Get Notes For Session
========================================================= */

const getSessionNotesController = asyncHandler(async (req, res) => {
  const result = await notesService.getSessionNotes(
    req.user.id,
    req.validatedParams.sessionId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Session notes fetched successfully."));
});

/* =========================================================
   Get My Shared Notes
   ---------------------------------------------------------
   Client ko sirf SHARED notes milenge.
========================================================= */

const getMySharedNotesController = asyncHandler(async (req, res) => {
  const result = await notesService.getMySharedNotes(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Shared notes fetched successfully."));
});

/* =========================================================
   Update Note
========================================================= */

const updateNoteController = asyncHandler(async (req, res) => {
  const result = await notesService.updateNote(
    req.user.id,
    req.validatedParams.id,
    req.validatedBody,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Session note updated successfully."));
});

/* =========================================================
   Delete Note
========================================================= */

const deleteNoteController = asyncHandler(async (req, res) => {
  const result = await notesService.deleteNote(
    req.user.id,
    req.validatedParams.id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Session note deleted successfully."));
});

/* =========================================================
   Exports
========================================================= */

module.exports = {
  createNoteController,
  getSessionNotesController,
  getMySharedNotesController,
  updateNoteController,
  deleteNoteController,
};
