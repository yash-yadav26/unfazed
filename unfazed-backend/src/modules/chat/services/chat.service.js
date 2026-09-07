const Therapist = require("../../therapist/models/therapist.model");
const Client = require("../../client/models/client.model");
const ApiError = require("../../../utils/apiError");

const {
  getChatMessages,
  markMessagesAsRead,
  getUnreadMessagesCount,
} = require("../repositories/chat.repository");

const {
  findSessionBetweenClientAndTherapist,
} = require("../../session/repositories/session.repository");

/* -------------------------------------------------------------------------- */
/*                         Get User Profile                                   */
/* -------------------------------------------------------------------------- */

/**
 * Identify whether the authenticated user is a CLIENT
 * or THERAPIST using the database.
 */
const getAuthenticatedChatParticipant = async (userId) => {
  const client = await Client.findOne({
    userId,
  }).select("_id userId");

  if (client) {
    return {
      userType: "CLIENT",
      profileId: client._id,
    };
  }

  const therapist = await Therapist.findOne({
    userId,
  }).select("_id userId");

  if (therapist) {
    return {
      userType: "THERAPIST",
      profileId: therapist._id,
    };
  }

  throw new ApiError(404, "Chat profile not found.", "CHAT_PROFILE_NOT_FOUND");
};

/* -------------------------------------------------------------------------- */
/*                         Validate Chat Access                               */
/* -------------------------------------------------------------------------- */

/**
 * Verify that the authenticated user can chat with the
 * requested therapist/client.
 *
 * CLIENT    -> booked THERAPIST
 * THERAPIST -> booked CLIENT
 */
const validateChatAccess = async ({ userId, otherUserId }) => {
  if (!userId || !otherUserId) {
    throw new ApiError(400, "User ID is required.");
  }

  if (String(userId) === String(otherUserId)) {
    throw new ApiError(
      400,
      "You cannot chat with yourself.",
      "SELF_CHAT_NOT_ALLOWED",
    );
  }

  const participant = await getAuthenticatedChatParticipant(userId);

  /* ------------------------------------------------------------------------ */
  /*                                CLIENT                                    */
  /* ------------------------------------------------------------------------ */

  if (participant.userType === "CLIENT") {
    const therapist =
      await Therapist.findById(otherUserId).select("_id userId");

    if (!therapist) {
      throw new ApiError(404, "Therapist not found.", "THERAPIST_NOT_FOUND");
    }

    const session = await findSessionBetweenClientAndTherapist(
      participant.profileId,
      therapist._id,
    );

    if (!session) {
      throw new ApiError(
        403,
        "You can only chat with a therapist you have a valid booking with.",
        "CHAT_ACCESS_DENIED",
      );
    }

    return {
      userType: "CLIENT",
      clientId: participant.profileId,
      therapistId: therapist._id,
      sessionId: session._id,
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                               THERAPIST                                  */
  /* ------------------------------------------------------------------------ */

  if (participant.userType === "THERAPIST") {
    const client = await Client.findById(otherUserId).select("_id userId");

    if (!client) {
      throw new ApiError(404, "Client not found.", "CLIENT_NOT_FOUND");
    }

    const session = await findSessionBetweenClientAndTherapist(
      client._id,
      participant.profileId,
    );

    if (!session) {
      throw new ApiError(
        403,
        "You can only chat with a client who has a valid booking with you.",
        "CHAT_ACCESS_DENIED",
      );
    }

    return {
      userType: "THERAPIST",
      clientId: client._id,
      therapistId: participant.profileId,
      sessionId: session._id,
    };
  }

  throw new ApiError(
    400,
    "Invalid chat participant type.",
    "INVALID_CHAT_PARTICIPANT",
  );
};

/* -------------------------------------------------------------------------- */
/*                         Get Chat Messages                                  */
/* -------------------------------------------------------------------------- */

const getChatMessagesService = async ({ userId, otherUserId }) => {
  const access = await validateChatAccess({
    userId,
    otherUserId,
  });

  const otherUserType = access.userType === "CLIENT" ? "THERAPIST" : "CLIENT";

  const messages = await getChatMessages({
    userId: access.userType === "CLIENT" ? access.clientId : access.therapistId,

    userType: access.userType,

    otherUserId:
      access.userType === "CLIENT" ? access.therapistId : access.clientId,

    otherUserType,
  });

  return messages;
};

/* -------------------------------------------------------------------------- */
/*                       Mark Messages As Read                                */
/* -------------------------------------------------------------------------- */

const markMessagesAsReadService = async ({ userId, otherUserId }) => {
  const access = await validateChatAccess({
    userId,
    otherUserId,
  });

  const otherUserType = access.userType === "CLIENT" ? "THERAPIST" : "CLIENT";

  const result = await markMessagesAsRead({
    userId: access.userType === "CLIENT" ? access.clientId : access.therapistId,

    userType: access.userType,

    otherUserId:
      access.userType === "CLIENT" ? access.therapistId : access.clientId,

    otherUserType,
  });

  return {
    modifiedCount: result.modifiedCount,
  };
};

/* -------------------------------------------------------------------------- */
/*                      Get Unread Messages Count                             */
/* -------------------------------------------------------------------------- */

/**
 * Get unread messages for the authenticated Client or Therapist.
 *
 * Returns conversation-wise unread counts so the frontend
 * can show badges on individual Chat buttons.
 */
const getUnreadMessagesCountService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required.");
  }

  const participant = await getAuthenticatedChatParticipant(userId);

  const conversations = await getUnreadMessagesCount({
    userId: participant.profileId,
    userType: participant.userType,
  });

  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  return {
    totalUnread,
    conversations,
  };
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  getAuthenticatedChatParticipant,
  validateChatAccess,
  getChatMessagesService,
  markMessagesAsReadService,
  getUnreadMessagesCountService,
};
