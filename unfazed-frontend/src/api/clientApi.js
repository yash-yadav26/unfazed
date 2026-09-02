import api from "./axios";

/* =========================================================
   Create Client Profile
========================================================= */

export const createClient = async (data) => {
  const response = await api.post("/clients", data);

  return response.data;
};

/* =========================================================
   Get My Client Profile
========================================================= */

export const getMyClientProfile = async () => {
  const response = await api.get("/clients/me");

  return response.data;
};

/* =========================================================
   Update My Client Profile
========================================================= */

export const updateMyClientProfile = async (data) => {
  const response = await api.patch("/clients/me", data);

  return response.data;
};

/* =========================================================
   Delete My Client Profile
========================================================= */

export const deleteMyClientProfile = async () => {
  const response = await api.delete("/clients/me");

  return response.data;
};

/* =========================================================
   Get My Clients
========================================================= */

/*
 * Therapist ke woh clients fetch honge
 * jinhone logged-in therapist ke saath
 * at least one session book ki hai.
 */

export const getMyClients = async () => {
  const response = await api.get("/clients/my-clients");

  return response.data;
};
