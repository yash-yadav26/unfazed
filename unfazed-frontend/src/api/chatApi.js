import api from "./axios";

/* -------------------------------------------------------------------------- */
/*                         Get Chat Messages                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get complete chat history between the logged-in user
 * and another therapist/client.
 *
 * @param {string} userId - Therapist or client profile ID
 */
export const getChatMessages = async (userId) => {
  const response = await api.get(`/chat/${userId}/messages`);

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                      Mark Messages As Read                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mark all unread messages from the selected therapist/client
 * as read.
 *
 * @param {string} userId - Therapist or client profile ID
 */
export const markMessagesAsRead = async (userId) => {
  const response = await api.patch(`/chat/${userId}/read`);

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                    Get Unread Messages Count                              */
/* -------------------------------------------------------------------------- */

/**
 * Get conversation-wise unread message counts for the
 * authenticated client or therapist.
 */
export const getUnreadMessagesCount = async () => {
  const response = await api.get("/chat/unread");

  return response.data;
};
