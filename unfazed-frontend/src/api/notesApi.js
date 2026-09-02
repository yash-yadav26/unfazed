import api from "./axios";

/* =========================================================
   Create Note
   ---------------------------------------------------------
   Therapist selected session ke liye
   PRIVATE ya SHARED note create karega.
========================================================= */

export const createNote = async (data) => {
  const response = await api.post("/notes", data);

  return response.data;
};

/* =========================================================
   Get Session Notes
   ---------------------------------------------------------
   Therapist ke selected session ke saare notes.
========================================================= */

export const getSessionNotes = async (sessionId) => {
  const response = await api.get(
    `/notes/session/${sessionId}`,
  );

  return response.data;
};

/* =========================================================
   Update Note
========================================================= */

export const updateNote = async (noteId, data) => {
  const response = await api.patch(
    `/notes/${noteId}`,
    data,
  );

  return response.data;
};

/* =========================================================
   Delete Note
========================================================= */

export const deleteNote = async (noteId) => {
  const response = await api.delete(
    `/notes/${noteId}`,
  );

  return response.data;
};

/* =========================================================
   Get My Shared Notes
   ---------------------------------------------------------
   Client ke liye.
   Sirf SHARED notes backend se milenge.
========================================================= */

export const getMySharedNotes = async () => {
  const response = await api.get("/notes/shared");

  return response.data;
};