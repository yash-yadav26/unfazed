import api from "./axios";

// ===============================
// Create Therapist Profile
// ===============================

export const createTherapist = async (data) => {
  const response = await api.post("/therapists", data);

  return response.data;
};

// ===============================
// Get My Therapist Profile
// ===============================

export const getMyTherapistProfile = async () => {
  const response = await api.get("/therapists/me");

  return response.data;
};

// ===============================
// Get All Therapists
// ===============================

export const getAllTherapists = async () => {
  const response = await api.get("/therapists");

  return response.data;
};

// ===============================
// Update My Therapist Profile
// ===============================

export const updateMyTherapistProfile = async (data) => {
  const response = await api.patch("/therapists/me", data);

  return response.data;
};

// ===============================
// Delete My Therapist Profile
// ===============================

export const deleteMyTherapistProfile = async () => {
  const response = await api.delete("/therapists/me");

  return response.data;
};