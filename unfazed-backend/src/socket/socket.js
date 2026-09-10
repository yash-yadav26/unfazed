const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const Session = require("../modules/session/models/session.model");
const Client = require("../modules/client/models/client.model");
const Therapist = require("../modules/therapist/models/therapist.model");

const registerChatSocket = require("./chat.socket");

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const APP_FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

const VIDEO_ROOM_PREFIX = "session:";

const ALLOWED_SESSION_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"];

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Create a consistent Socket.io room ID for a session.
 */
const getRoomId = (sessionId) => {
  return `${VIDEO_ROOM_PREFIX}${sessionId}`;
};

/**
 * Extract JWT from Socket.io handshake.
 *
 * Frontend:
 *
 * socket = io(API_URL, {
 *   auth: {
 *     token: accessToken,
 *   },
 * });
 */
const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (authToken) {
    return authToken.startsWith("Bearer ") ? authToken.substring(7) : authToken;
  }

  /**
   * Fallback:
   * Also support Authorization header.
   */
  const authorizationHeader = socket.handshake.headers?.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.substring(7);
  }

  return null;
};

/**
 * Verify JWT and return authenticated user ID.
 */
const authenticateSocket = (socket) => {
  const token = extractToken(socket);

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const decoded = jwt.verify(token, secret);

  if (!decoded?.id) {
    throw new Error("Invalid authentication token.");
  }

  socket.user = {
    id: decoded.id,
  };

  return socket.user;
};

/**
 * Check whether authenticated user is actually
 * a participant of the requested session.
 */
const getSessionParticipant = async (userId, session) => {
  /* ------------------------------------------------------------------------ */
  /*                                CLIENT                                    */
  /* ------------------------------------------------------------------------ */

  const client = await Client.findOne({
    userId,
  }).select("_id userId");

  if (client && client._id.toString() === session.clientId.toString()) {
    return {
      role: "CLIENT",
      profileId: client._id,
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                               THERAPIST                                   */
  /* ------------------------------------------------------------------------ */

  const therapist = await Therapist.findOne({
    userId,
  }).select("_id userId");

  if (
    therapist &&
    therapist._id.toString() === session.therapistId.toString()
  ) {
    return {
      role: "THERAPIST",
      profileId: therapist._id,
    };
  }

  return null;
};

/**
 * Check whether this participant has successfully
 * joined the session through the REST join API.
 */
const hasParticipantJoined = (session, role) => {
  if (role === "CLIENT") {
    return Boolean(session.clientJoined);
  }

  if (role === "THERAPIST") {
    return Boolean(session.therapistJoined);
  }

  return false;
};

/**
 * Emit a safe socket error to the client.
 */
const emitSocketError = (socket, message, code) => {
  socket.emit("socket-error", {
    success: false,
    code,
    message,
  });
};

/* -------------------------------------------------------------------------- */
/*                         Initialize Socket.io                               */
/* -------------------------------------------------------------------------- */

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: APP_FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },

    /**
     * WebSocket is preferred.
     * Polling remains available as fallback.
     */
    transports: ["websocket", "polling"],
  });

  /* ------------------------------------------------------------------------ */
  /*                         Socket Authentication                            */
  /* ------------------------------------------------------------------------ */

  io.use((socket, next) => {
    try {
      authenticateSocket(socket);

      next();
    } catch (error) {
      console.error("[Socket.io] Authentication failed:", error.message);

      const authError = new Error("Socket authentication failed.");

      authError.data = {
        code: "SOCKET_AUTH_FAILED",
        message: error.message,
      };

      next(authError);
    }
  });

  /* ------------------------------------------------------------------------ */
  /*                           Connection                                     */
  /* ------------------------------------------------------------------------ */

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Authenticated user connected: ${socket.user.id}`);

    /* ---------------------------------------------------------------------- */
    /*                             VIDEO CALL                                  */
    /* ---------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------- */
    /*                             Join Room                                  */
    /* ---------------------------------------------------------------------- */

    socket.on("join-room", async ({ sessionId } = {}, acknowledgement) => {
      try {
        /* -------------------------- Validate Input ------------------------- */

        if (!sessionId) {
          const errorResponse = {
            success: false,
            code: "SESSION_ID_REQUIRED",
            message: "Session ID is required.",
          };

          if (typeof acknowledgement === "function") {
            acknowledgement(errorResponse);
          }

          emitSocketError(socket, errorResponse.message, errorResponse.code);

          return;
        }

        /* -------------------------- Find Session --------------------------- */

        const session = await Session.findById(sessionId)
          .select(
            "_id clientId therapistId status clientJoined therapistJoined",
          )
          .lean();

        if (!session) {
          const errorResponse = {
            success: false,
            code: "SESSION_NOT_FOUND",
            message: "Session not found.",
          };

          if (typeof acknowledgement === "function") {
            acknowledgement(errorResponse);
          }

          emitSocketError(socket, errorResponse.message, errorResponse.code);

          return;
        }

        /* ------------------------- Validate Status ------------------------ */

        if (!ALLOWED_SESSION_STATUSES.includes(session.status)) {
          const errorResponse = {
            success: false,
            code: "SESSION_NOT_AVAILABLE",
            message: "This session is not available for video calling.",
          };

          if (typeof acknowledgement === "function") {
            acknowledgement(errorResponse);
          }

          emitSocketError(socket, errorResponse.message, errorResponse.code);

          return;
        }

        /* ---------------------- Identify Participant ---------------------- */

        const participant = await getSessionParticipant(
          socket.user.id,
          session,
        );

        if (!participant) {
          const errorResponse = {
            success: false,
            code: "SESSION_ACCESS_DENIED",
            message: "You are not a participant of this session.",
          };

          if (typeof acknowledgement === "function") {
            acknowledgement(errorResponse);
          }

          emitSocketError(socket, errorResponse.message, errorResponse.code);

          return;
        }

        /* ----------------------- Join REST Check -------------------------- */

        if (!hasParticipantJoined(session, participant.role)) {
          const errorResponse = {
            success: false,
            code: "SESSION_NOT_JOINED",
            message:
              "Join the session through the session API before entering the video room.",
          };

          if (typeof acknowledgement === "function") {
            acknowledgement(errorResponse);
          }

          emitSocketError(socket, errorResponse.message, errorResponse.code);

          return;
        }

        /* -------------------------- Room ID -------------------------------- */

        const roomId = getRoomId(sessionId);

        /* ----------------------- Existing Members ------------------------- */

        const room = io.sockets.adapter.rooms.get(roomId);

        const currentParticipants = room ? room.size : 0;

        /**
         * A therapy session has exactly two participants:
         *
         * 1. Client
         * 2. Therapist
         *
         * Prevent extra sockets from entering the room.
         */
        if (!socket.rooms.has(roomId) && currentParticipants >= 2) {
          const errorResponse = {
            success: false,
            code: "SESSION_ROOM_FULL",
            message: "This session already has both participants connected.",
          };

          if (typeof acknowledgement === "function") {
            acknowledgement(errorResponse);
          }

          emitSocketError(socket, errorResponse.message, errorResponse.code);

          return;
        }

        /* ---------------------------- Join -------------------------------- */

        // Keep one active video-session room per socket.
        if (socket.sessionRoom && socket.sessionRoom.roomId !== roomId) {
          socket.leave(socket.sessionRoom.roomId);
        }

        socket.join(roomId);

        socket.sessionRoom = {
          roomId,
          sessionId: session._id.toString(),
          role: participant.role,
        };

        const peerCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;

        console.log(
          `[Socket.io] ${participant.role} ${socket.user.id} joined ${roomId} (${peerCount}/2 participants)`,
        );

        /* ----------------------- Current Participant ---------------------- */

        const roomJoinedPayload = {
          success: true,
          roomId,
          sessionId: session._id.toString(),
          participant: participant.role,
          peerCount,
        };

        socket.emit("room-joined", roomJoinedPayload);

        /**
         * Supports frontend Socket.io acknowledgement callbacks.
         *
         * Example:
         * socket.emit("join-room", payload, (response) => {});
         */
        if (typeof acknowledgement === "function") {
          acknowledgement(roomJoinedPayload);
        }

        /* ---------------------- Notify Other Side ------------------------- */

        socket.to(roomId).emit("participant-joined", {
          participant: participant.role,
          socketId: socket.id,
          peerCount,
        });
      } catch (error) {
        console.error("[Socket.io] Join room failed:", error);

        const message = error?.message || "Unable to join the video room.";

        const errorResponse = {
          success: false,
          code: "ROOM_JOIN_FAILED",
          message,
        };

        if (typeof acknowledgement === "function") {
          acknowledgement(errorResponse);
        }

        emitSocketError(socket, message, "ROOM_JOIN_FAILED");
      }
    });

    /* ---------------------------------------------------------------------- */
    /*                               OFFER                                    */
    /* ---------------------------------------------------------------------- */

    socket.on("offer", ({ sessionId, offer }) => {
      try {
        if (!sessionId || !offer) {
          emitSocketError(
            socket,
            "Session ID and offer are required.",
            "INVALID_OFFER",
          );

          return;
        }

        const roomId = getRoomId(sessionId);

        if (!socket.rooms.has(roomId)) {
          emitSocketError(
            socket,
            "You are not connected to this session room.",
            "ROOM_ACCESS_DENIED",
          );

          return;
        }

        socket.to(roomId).emit("offer", {
          offer,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("[Socket.io] Offer handling failed:", error);
      }
    });

    /* ---------------------------------------------------------------------- */
    /*                               ANSWER                                   */
    /* ---------------------------------------------------------------------- */

    socket.on("answer", ({ sessionId, answer }) => {
      try {
        if (!sessionId || !answer) {
          emitSocketError(
            socket,
            "Session ID and answer are required.",
            "INVALID_ANSWER",
          );

          return;
        }

        const roomId = getRoomId(sessionId);

        if (!socket.rooms.has(roomId)) {
          emitSocketError(
            socket,
            "You are not connected to this session room.",
            "ROOM_ACCESS_DENIED",
          );

          return;
        }

        socket.to(roomId).emit("answer", {
          answer,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("[Socket.io] Answer handling failed:", error);
      }
    });

    /* ---------------------------------------------------------------------- */
    /*                           ICE CANDIDATE                                 */
    /* ---------------------------------------------------------------------- */

    socket.on("ice-candidate", ({ sessionId, candidate }) => {
      try {
        if (!sessionId || !candidate) {
          emitSocketError(
            socket,
            "Session ID and ICE candidate are required.",
            "INVALID_ICE_CANDIDATE",
          );

          return;
        }

        const roomId = getRoomId(sessionId);

        if (!socket.rooms.has(roomId)) {
          emitSocketError(
            socket,
            "You are not connected to this session room.",
            "ROOM_ACCESS_DENIED",
          );

          return;
        }

        socket.to(roomId).emit("ice-candidate", {
          candidate,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("[Socket.io] ICE candidate handling failed:", error);
      }
    });

    /* ---------------------------------------------------------------------- */
    /*                             LEAVE ROOM                                 */
    /* ---------------------------------------------------------------------- */

    socket.on("leave-room", () => {
      try {
        const sessionRoom = socket.sessionRoom;

        if (!sessionRoom) {
          return;
        }

        const { roomId, role } = sessionRoom;

        socket.leave(roomId);

        socket.to(roomId).emit("participant-left", {
          participant: role,
          socketId: socket.id,
        });

        console.log(`[Socket.io] ${role} ${socket.user.id} left ${roomId}`);

        socket.sessionRoom = null;
      } catch (error) {
        console.error("[Socket.io] Leave room failed:", error);
      }
    });

    /* ---------------------------------------------------------------------- */
    /*                            DISCONNECT                                  */
    /* ---------------------------------------------------------------------- */

    socket.on("disconnect", (reason) => {
      const sessionRoom = socket.sessionRoom;

      if (sessionRoom) {
        const { roomId, role } = sessionRoom;

        socket.to(roomId).emit("participant-left", {
          participant: role,
          socketId: socket.id,
        });
      }

      console.log(`[Socket.io] User ${socket.user.id} disconnected.`, reason);
    });

    /* ---------------------------------------------------------------------- */
    /*                               CHAT                                     */
    /* ---------------------------------------------------------------------- */

    /**
     * Register chat events on the same authenticated socket.
     *
     * chat.socket.js handles:
     * - join-chat
     * - send-message
     * - typing
     * - stop-typing
     * - leave-chat
     */
    registerChatSocket(io, socket);
  });

  console.log("[Socket.io] Secure socket server initialized.");

  return io;
};

module.exports = initializeSocket;
