import api from "./axios";

/**
 * Get available session slots for a therapist on a selected date.
 *
 * GET /api/session/slots
 *
 * @param {Object} params
 * @param {string} params.therapistId
 * @param {string} params.date - YYYY-MM-DD
 */
export const getAvailableSessionSlots = async ({ therapistId, date }) => {
  const response = await api.get("/session/slots", {
    params: {
      therapistId,
      date,
    },
  });

  return response.data;
};

/**
 * Create a session booking.
 *
 * POST /api/session
 *
 * @param {Object} data
 * @param {string} data.therapistId
 * @param {string} data.date
 * @param {string} data.startTime
 */
export const createSession = async (data) => {
  const response = await api.post("/session", data);

  return response.data;
};

/**
 * Get all sessions of the logged-in client.
 *
 * GET /api/session/my-sessions
 */
export const getMySessions = async () => {
  const response = await api.get("/session/my-sessions");

  return response.data;
};

/**
 * Get a single session by ID.
 *
 * GET /api/session/:id
 *
 * @param {string} sessionId
 */
export const getSessionById = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}`);

  return response.data;
};

/**
 * Join a scheduled therapy session.
 *
 * POST /api/session/:id/join
 *
 * The backend identifies whether the authenticated
 * user is the client or therapist.
 *
 * No role is required from the frontend.
 *
 * @param {string} sessionId
 */
export const joinSession = async (sessionId) => {
  const response = await api.post(`/session/${sessionId}/join`);

  return response.data;
};

/**
 * Cancel a session.
 *
 * PATCH /api/session/:id/cancel
 *
 * @param {string} sessionId
 */
export const cancelSession = async (sessionId) => {
  const response = await api.patch(`/session/${sessionId}/cancel`);

  return response.data;
};
