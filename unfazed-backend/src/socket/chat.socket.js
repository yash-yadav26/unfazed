const Therapist = require("../modules/therapist/models/therapist.model");
const Client = require("../modules/client/models/client.model");

const {
  createMessage,
  getUnreadMessagesCount,
} = require("../modules/chat/repositories/chat.repository");

const {
  createNotification,
} = require("../modules/notification/services/notification.service");

const {
  countUnreadNotifications,
} = require("../modules/notification/repositories/notification.repository");

const {
  NOTIFICATION_TYPES,
} = require("../modules/notification/models/notification.model");

const { validateChatAccess } = require("../modules/chat/services/chat.service");

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const CHAT_ROOM_PREFIX = "chat:";
const USER_ROOM_PREFIX = "user:";

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const getChatRoomId = (clientId, therapistId) => {
  return `${CHAT_ROOM_PREFIX}${clientId}:${therapistId}`;
};

const getUserRoomId = (userId) => {
  return `${USER_ROOM_PREFIX}${userId}`;
};

const emitChatError = (socket, message, code) => {
  socket.emit("chat-error", {
    success: false,
    code,
    message,
  });
};

const validateMessageText = (message) => {
  if (typeof message !== "string") {
    return false;
  }

  const trimmedMessage = message.trim();

  return Boolean(trimmedMessage) && trimmedMessage.length <= 2000;
};

/* -------------------------------------------------------------------------- */
/*                         Get Receiver Account ID                            */
/* -------------------------------------------------------------------------- */

/**
 * Message receiverId stores CLIENT/THERAPIST profile id.
 *
 * Socket authentication uses the main User id.
 * This helper resolves the receiver profile id to its User id
 * so the unread events and notifications can be emitted
 * to the receiver's private room.
 */
const getReceiverAccountId = async ({ receiverId, receiverType }) => {
  if (receiverType === "CLIENT") {
    const client = await Client.findById(receiverId).select("userId");

    return client?.userId || null;
  }

  if (receiverType === "THERAPIST") {
    const therapist = await Therapist.findById(receiverId).select("userId");

    return therapist?.userId || null;
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/*                          Register Chat Socket                              */
/* -------------------------------------------------------------------------- */

const registerChatSocket = (io, socket) => {
  /* ------------------------------------------------------------------------ */
  /*                         Private User Room                                */
  /* ------------------------------------------------------------------------ */

  /**
   * Every authenticated user joins their own private room.
   *
   * This allows unread chat and notification updates to reach
   * the user even when they are not currently inside a specific chat room.
   */
  const userRoomId = getUserRoomId(socket.user.id);

  socket.join(userRoomId);

  console.log(
    `[Socket.io] User ${socket.user.id} joined private room ${userRoomId}`,
  );

  /* ------------------------------------------------------------------------ */
  /*                              Join Chat                                   */
  /* ------------------------------------------------------------------------ */

  socket.on("join-chat", async ({ userId: otherUserId } = {}, callback) => {
    try {
      if (!otherUserId) {
        const errorResponse = {
          success: false,
          code: "CHAT_USER_ID_REQUIRED",
          message: "User ID is required.",
        };

        emitChatError(socket, errorResponse.message, errorResponse.code);

        if (typeof callback === "function") {
          callback(errorResponse);
        }

        return;
      }

      const access = await validateChatAccess({
        userId: socket.user.id,
        otherUserId,
      });

      const roomId = getChatRoomId(access.clientId, access.therapistId);

      /* -------------------------------------------------------------------- */
      /*                         Leave Previous Chat                           */
      /* -------------------------------------------------------------------- */

      if (socket.chatRoomId && socket.chatRoomId !== roomId) {
        socket.leave(socket.chatRoomId);
      }

      /* -------------------------------------------------------------------- */
      /*                             Join Room                                 */
      /* -------------------------------------------------------------------- */

      socket.join(roomId);

      socket.chatRoomId = roomId;

      socket.chatParticipant = {
        userType: access.userType,
        clientId: access.clientId.toString(),
        therapistId: access.therapistId.toString(),
        sessionId: access.sessionId.toString(),
      };

      const response = {
        success: true,
        roomId,
        sessionId: access.sessionId,
        userType: access.userType,
      };

      socket.emit("chat-joined", response);

      if (typeof callback === "function") {
        callback(response);
      }

      console.log(
        `[Socket.io] ${access.userType} ${socket.user.id} joined ${roomId}`,
      );
    } catch (error) {
      console.error("[Socket.io] Join chat failed:", error);

      emitChatError(
        socket,
        error?.message || "Unable to join chat.",
        error?.code || "CHAT_JOIN_FAILED",
      );

      if (typeof callback === "function") {
        callback({
          success: false,
          code: error?.code || "CHAT_JOIN_FAILED",
          message: error?.message || "Unable to join chat.",
        });
      }
    }
  });

  /* ------------------------------------------------------------------------ */
  /*                            Send Message                                  */
  /* ------------------------------------------------------------------------ */

  socket.on(
    "send-message",
    async ({ userId: otherUserId, message } = {}, callback) => {
      try {
        if (!otherUserId) {
          throw new Error("Receiver user ID is required.");
        }

        if (!validateMessageText(message)) {
          throw new Error(
            "Message must be non-empty and cannot exceed 2000 characters.",
          );
        }

        /* ------------------------------------------------------------------ */
        /*                Validate Booking / Chat Access                      */
        /* ------------------------------------------------------------------ */

        const access = await validateChatAccess({
          userId: socket.user.id,
          otherUserId,
        });

        const roomId = getChatRoomId(access.clientId, access.therapistId);

        /* ------------------------------------------------------------------ */
        /*                           Room Validation                          */
        /* ------------------------------------------------------------------ */

        if (!socket.rooms.has(roomId)) {
          throw new Error("Join the chat room before sending messages.");
        }

        /* ------------------------------------------------------------------ */
        /*                    Determine Sender / Receiver                     */
        /* ------------------------------------------------------------------ */

        const senderId =
          access.userType === "CLIENT" ? access.clientId : access.therapistId;

        const receiverId =
          access.userType === "CLIENT" ? access.therapistId : access.clientId;

        const receiverType =
          access.userType === "CLIENT" ? "THERAPIST" : "CLIENT";

        /* ------------------------------------------------------------------ */
        /*                           Save Message                              */
        /* ------------------------------------------------------------------ */

        const savedMessage = await createMessage({
          senderId,
          senderType: access.userType,
          receiverId,
          receiverType,
          message: message.trim(),
        });

        const messageData = savedMessage.toObject
          ? savedMessage.toObject()
          : savedMessage;

        /* ------------------------------------------------------------------ */
        /*                    Send To Chat Participants                       */
        /* ------------------------------------------------------------------ */

        io.to(roomId).emit("new-message", {
          success: true,
          message: messageData,
        });

        /* ------------------------------------------------------------------ */
        /*                    Get Receiver Account ID                         */
        /* ------------------------------------------------------------------ */

        const receiverAccountId = await getReceiverAccountId({
          receiverId,
          receiverType,
        });

        if (receiverAccountId) {
          /* ---------------------------------------------------------------- */
          /*                  Update Chat Unread Count                         */
          /* ---------------------------------------------------------------- */

          const unreadConversations = await getUnreadMessagesCount({
            userId: receiverId,
            userType: receiverType,
          });

          const unreadConversation = unreadConversations.find(
            (conversation) =>
              String(conversation.userId) === String(senderId) &&
              conversation.userType === access.userType,
          );

          const unreadCount = unreadConversation?.unreadCount || 0;

          io.to(getUserRoomId(receiverAccountId)).emit("chat-unread-updated", {
            success: true,
            userId: senderId,
            userType: access.userType,
            unreadCount,
            totalUnread: unreadConversations.reduce(
              (total, conversation) => total + conversation.unreadCount,
              0,
            ),
          });

          /* ---------------------------------------------------------------- */
          /*                  Create Persistent Notification                   */
          /* ---------------------------------------------------------------- */

          try {
            await createNotification({
              recipientId: receiverAccountId,
              type: NOTIFICATION_TYPES.CHAT_MESSAGE,
              title:
                access.userType === "CLIENT"
                  ? "New message from your client"
                  : "New message from your therapist",
              message: "You have a new chat message.",
            });

            /* -------------------------------------------------------------- */
            /*              Get Updated Notification Count                    */
            /* -------------------------------------------------------------- */

            const notificationUnreadCount =
              await countUnreadNotifications(receiverAccountId);

            /* -------------------------------------------------------------- */
            /*              Update Notification Bell Realtime                */
            /* -------------------------------------------------------------- */

            io.to(getUserRoomId(receiverAccountId)).emit(
              "notification-unread-updated",
              {
                success: true,
                unreadCount: notificationUnreadCount,
              },
            );
          } catch (notificationError) {
            /**
             * Notification failure should not fail
             * the actual chat message.
             */
            console.error(
              "[Socket.io] Chat notification creation failed:",
              notificationError,
            );
          }
        }

        /* ------------------------------------------------------------------ */
        /*                              ACK                                   */
        /* ------------------------------------------------------------------ */

        if (typeof callback === "function") {
          callback({
            success: true,
            message: messageData,
          });
        }

        console.log(`[Socket.io] ${access.userType} sent message in ${roomId}`);
      } catch (error) {
        console.error("[Socket.io] Send message failed:", error);

        emitChatError(
          socket,
          error?.message || "Unable to send message.",
          error?.code || "MESSAGE_SEND_FAILED",
        );

        if (typeof callback === "function") {
          callback({
            success: false,
            code: error?.code || "MESSAGE_SEND_FAILED",
            message: error?.message || "Unable to send message.",
          });
        }
      }
    },
  );

  /* ------------------------------------------------------------------------ */
  /*                                Typing                                    */
  /* ------------------------------------------------------------------------ */

  socket.on("typing", () => {
    if (!socket.chatRoomId) {
      return;
    }

    socket.to(socket.chatRoomId).emit("typing", {
      userId: socket.user.id,
    });
  });

  socket.on("stop-typing", () => {
    if (!socket.chatRoomId) {
      return;
    }

    socket.to(socket.chatRoomId).emit("stop-typing", {
      userId: socket.user.id,
    });
  });

  /* ------------------------------------------------------------------------ */
  /*                              Leave Chat                                  */
  /* ------------------------------------------------------------------------ */

  socket.on("leave-chat", () => {
    if (!socket.chatRoomId) {
      return;
    }

    const roomId = socket.chatRoomId;

    socket.leave(roomId);

    socket.to(roomId).emit("chat-user-left", {
      userId: socket.user.id,
    });

    socket.chatRoomId = null;
    socket.chatParticipant = null;

    console.log(`[Socket.io] User ${socket.user.id} left ${roomId}`);
  });
};

module.exports = registerChatSocket;
