import api from "./axios";

// ===============================
// Create Client Profile
// ===============================

export const createClient = async (data) => {
  const response = await api.post("/clients", data);

  return response.data;
};

// ===============================
// Get My Client Profile
// ===============================

export const getMyClientProfile = async () => {
  const response = await api.get("/clients/me");

  return response.data;
};

// ===============================
// Update My Client Profile
// ===============================

export const updateMyClientProfile = async (data) => {
  const response = await api.patch("/clients/me", data);

  return response.data;
};

// ===============================
// Delete My Client Profile
// ===============================

export const deleteMyClientProfile = async () => {
  const response = await api.delete("/clients/me");

  return response.data;
};
