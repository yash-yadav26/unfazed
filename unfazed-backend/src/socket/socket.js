const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const Session = require("../modules/session/models/session.model");
const Client = require("../modules/client/models/client.model");
const Therapist = require("../modules/therapist/models/therapist.model");

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
 * Frontend will send:
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
 *
 * Expected payload:
 * {
 *   id: "userId",
 *   ...
 * }
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
 *
 * This prevents someone from bypassing:
 *
 * POST /api/session/:id/join
 *
 * and directly entering the WebRTC room.
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
     * Transport configuration.
     *
     * websocket is preferred, polling remains available
     * as a fallback for development environments.
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
  /*                           Connection                                    */
  /* ------------------------------------------------------------------------ */

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Authenticated user connected: ${socket.user.id}`);

    /* ---------------------------------------------------------------------- */
    /*                             Join Room                                  */
    /* ---------------------------------------------------------------------- */

    socket.on("join-room", async ({ sessionId }) => {
      try {
        /* -------------------------- Validate Input ------------------------- */

        if (!sessionId) {
          emitSocketError(
            socket,
            "Session ID is required.",
            "SESSION_ID_REQUIRED",
          );

          return;
        }

        /* -------------------------- Find Session --------------------------- */

        const session = await Session.findById(sessionId)
          .select(
            "_id clientId therapistId status clientJoined therapistJoined",
          )
          .lean();

        if (!session) {
          emitSocketError(socket, "Session not found.", "SESSION_NOT_FOUND");

          return;
        }

        /* ------------------------- Validate Status ------------------------ */

        if (!ALLOWED_SESSION_STATUSES.includes(session.status)) {
          emitSocketError(
            socket,
            "This session is not available for video calling.",
            "SESSION_NOT_AVAILABLE",
          );

          return;
        }

        /* ---------------------- Identify Participant ---------------------- */

        const participant = await getSessionParticipant(
          socket.user.id,
          session,
        );

        if (!participant) {
          emitSocketError(
            socket,
            "You are not a participant of this session.",
            "SESSION_ACCESS_DENIED",
          );

          return;
        }

        /* ----------------------- Join REST Check -------------------------- */

        if (!hasParticipantJoined(session, participant.role)) {
          emitSocketError(
            socket,
            "Join the session through the session API before entering the video room.",
            "SESSION_NOT_JOINED",
          );

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
         *
         * If the same socket reconnects, socket.rooms already
         * contains the room and it will not increase the count.
         */
        if (!socket.rooms.has(roomId) && currentParticipants >= 2) {
          emitSocketError(
            socket,
            "This session already has both participants connected.",
            "SESSION_ROOM_FULL",
          );

          return;
        }

        /* ---------------------------- Join -------------------------------- */

        socket.join(roomId);

        /**
         * Store session information on socket.
         *
         * Useful for cleanup and disconnect handling.
         */
        socket.sessionRoom = {
          roomId,
          sessionId: session._id.toString(),
          role: participant.role,
        };

        console.log(
          `[Socket.io] ${participant.role} ${socket.user.id} joined ${roomId}`,
        );

        /* ----------------------- Current Participant ---------------------- */

        socket.emit("room-joined", {
          success: true,
          roomId,
          sessionId: session._id,
          participant: participant.role,
        });

        /* ---------------------- Notify Other Side ------------------------- */

        socket.to(roomId).emit("participant-joined", {
          participant: participant.role,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("[Socket.io] Join room failed:", error);

        emitSocketError(
          socket,
          "Unable to join the video room.",
          "ROOM_JOIN_FAILED",
        );
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

        /**
         * Only forward if this socket is actually inside
         * the requested session room.
         */
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

        const { roomId, sessionId, role } = sessionRoom;

        socket.leave(roomId);

        socket.to(roomId).emit("participant-left", {
          participant: role,
          socketId: socket.id,
        });

        console.log(`[Socket.io] ${role} ${socket.user.id} left ${roomId}`);

        socket.sessionRoom = null;

        /**
         * Important:
         * Leaving the video room does NOT automatically reset
         * clientJoined / therapistJoined in MongoDB.
         *
         * Those fields represent that the participant joined
         * the scheduled session.
         */
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
  });

  console.log("[Socket.io] Secure socket server initialized.");

  return io;
};

module.exports = initializeSocket;
