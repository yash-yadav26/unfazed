import api from "./axios";

// ===============================
// Create Availability
// ===============================

export const createAvailability = async (data) => {
  const response = await api.post("/scheduling/availability", data);

  return response.data;
};

// ===============================
// Get My Availability
// ===============================

export const getMyAvailability = async () => {
  const response = await api.get("/scheduling/availability");

  return response.data;
};

// ===============================
// Update Availability
// ===============================

export const updateAvailability = async (id, data) => {
  const response = await api.patch(`/scheduling/availability/${id}`, data);

  return response.data;
};

// ===============================
// Delete Availability
// ===============================

export const deleteAvailability = async (id) => {
  const response = await api.delete(`/scheduling/availability/${id}`);

  return response.data;
};
