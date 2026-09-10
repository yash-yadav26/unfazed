const Availability = require("../../scheduling/models/availability.model");
const Therapist = require("../../therapist/models/therapist.model");
const Client = require("../../client/models/client.model");
const Session = require("../models/session.model");
const notificationService = require("../../notification/services/notification.service");
const sessionRepository = require("../repositories/session.repository");
const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sessions with these statuses occupy a therapist's slot.
 */
const ACTIVE_SESSION_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

/**
 * Sessions that can be processed by the
 * session end / no-show job.
 *
 * PENDING is intentionally excluded because
 * it may represent an unpaid/unconfirmed booking.
 */
const SESSION_END_CHECK_STATUSES = ["CONFIRMED", "IN_PROGRESS"];

/**
 * Application timezone.
 */
const APP_TIMEZONE = "Asia/Kolkata";

/* -------------------------------------------------------------------------- */
/*                               Date Helpers                                 */
/* -------------------------------------------------------------------------- */

/**
 * Convert YYYY-MM-DD into a Date stored consistently at UTC midnight.
 */
const parseDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Validate YYYY-MM-DD strictly.
 */
const isValidDateString = (dateString) => {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }

  const parsedDate = parseDate(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
};

/**
 * Get today's date in application timezone as YYYY-MM-DD.
 */
const getTodayDateString = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
};

/**
 * Check whether selected date is today.
 */
const isToday = (dateString) => {
  return dateString === getTodayDateString();
};

/**
 * Get current time in application timezone as total minutes.
 *
 * Example:
 * 16:30 -> 990
 */
const getCurrentTimeMinutes = () => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());

  const hours = Number(parts.find((part) => part.type === "hour")?.value);

  const minutes = Number(parts.find((part) => part.type === "minute")?.value);

  return hours * 60 + minutes;
};

/* -------------------------------------------------------------------------- */
/*                            Day Of Week Helper                              */
/* -------------------------------------------------------------------------- */

const getDayOfWeek = (dateString) => {
  const date = parseDate(dateString);

  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return days[date.getUTCDay()];
};

/* -------------------------------------------------------------------------- */
/*                              Time Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Convert HH:mm into total minutes.
 *
 * Example:
 * 10:30 -> 630
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

/**
 * Convert total minutes into HH:mm.
 *
 * Example:
 * 630 -> 10:30
 */
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

/* -------------------------------------------------------------------------- */
/*                       Session DateTime Helpers                             */
/* -------------------------------------------------------------------------- */

/**
 * Convert session date + local time into an actual DateTime.
 *
 * Session date is stored as UTC midnight.
 * Session times are stored as Asia/Kolkata local clock time.
 */
const getSessionDateTime = (session, timeField) => {
  if (!session?.date || !session?.[timeField]) {
    return null;
  }

  const date = new Date(session.date);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const [hours, minutes] = String(session[timeField]).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  /**
   * Convert Asia/Kolkata local time to UTC.
   * IST = UTC + 5:30
   */
  return new Date(
    Date.UTC(year, month, day, hours, minutes, 0, 0) - 5.5 * 60 * 60 * 1000,
  );
};

/**
 * Get actual end DateTime of a session.
 */
const getSessionEndDateTime = (session) => {
  return getSessionDateTime(session, "endTime");
};

/* -------------------------------------------------------------------------- */
/*                        Session End Processing                              */
/* -------------------------------------------------------------------------- */

/**
 * Process sessions whose scheduled end time has passed.
 *
 * Rules:
 *
 * 1. Both participants joined
 *    -> COMPLETED
 *
 * 2. Client joined, therapist did not join
 *    -> NO_SHOW
 *
 * 3. Therapist joined, client did not join
 *    -> NO_SHOW
 *
 * 4. Neither joined
 *    -> NO_SHOW
 *
 * Important:
 * COMPLETED is NOT decided when the second participant joins.
 * It is decided only after the scheduled session end time.
 */
const completeExpiredSessions = async () => {
  const today = parseDate(getTodayDateString());

  const candidateSessions = await Session.find({
    status: {
      $in: SESSION_END_CHECK_STATUSES,
    },

    date: {
      $lte: today,
    },
  })
    .select(
      "_id clientId therapistId date endTime status clientJoined therapistJoined",
    )
    .lean();

  if (!candidateSessions.length) {
    return {
      completedCount: 0,
      noShowCount: 0,
    };
  }

  const now = new Date();

  const expiredSessions = candidateSessions.filter((session) => {
    const endDateTime = getSessionEndDateTime(session);

    return endDateTime && endDateTime <= now;
  });

  if (!expiredSessions.length) {
    return {
      completedCount: 0,
      noShowCount: 0,
    };
  }

  let completedCount = 0;
  let noShowCount = 0;

  for (const session of expiredSessions) {
    /**
     * Both participants joined during the scheduled session.
     * Mark the session completed after the scheduled end time.
     */
    if (session.clientJoined && session.therapistJoined) {
      const completedSession = await sessionRepository.markSessionAsCompleted(
        session._id,
      );

      if (completedSession) {
        completedCount += 1;
      }

      continue;
    }

    /* ---------------------------------------------------------------------- */
    /*                               NO SHOW                                  */
    /* ---------------------------------------------------------------------- */

    const noShowSession = await sessionRepository.markSessionAsNoShow(
      session._id,
    );

    if (!noShowSession) {
      continue;
    }

    noShowCount += 1;

    /* ---------------------------------------------------------------------- */
    /*                        Get Notification Users                          */
    /* ---------------------------------------------------------------------- */

    try {
      const client = await Client.findById(session.clientId).select(
        "_id userId",
      );

      const therapist = await Therapist.findById(session.therapistId).select(
        "_id userId",
      );

      /* -------------------------------------------------------------------- */
      /*                     Client Did Not Join                              */
      /* -------------------------------------------------------------------- */

      if (!session.clientJoined && session.therapistJoined) {
        if (therapist?.userId) {
          await notificationService.createNotification({
            recipientId: therapist.userId,
            type: "SESSION_NO_SHOW",
            title: "Client Did Not Join",
            message: "The client did not join the scheduled therapy session.",
            sessionId: noShowSession._id,
          });
        }

        continue;
      }

      /* -------------------------------------------------------------------- */
      /*                    Therapist Did Not Join                            */
      /* -------------------------------------------------------------------- */

      if (session.clientJoined && !session.therapistJoined) {
        if (client?.userId) {
          await notificationService.createNotification({
            recipientId: client.userId,
            type: "SESSION_NO_SHOW",
            title: "Therapist Did Not Join",
            message:
              "The therapist did not join the scheduled therapy session.",
            sessionId: noShowSession._id,
          });
        }

        continue;
      }

      /* -------------------------------------------------------------------- */
      /*                         Neither Joined                               */
      /* -------------------------------------------------------------------- */

      if (!session.clientJoined && !session.therapistJoined) {
        if (client?.userId) {
          await notificationService.createNotification({
            recipientId: client.userId,
            type: "SESSION_NO_SHOW",
            title: "Session Missed",
            message:
              "The scheduled therapy session was missed because the session was not joined.",
            sessionId: noShowSession._id,
          });
        }

        if (therapist?.userId) {
          await notificationService.createNotification({
            recipientId: therapist.userId,
            type: "SESSION_NO_SHOW",
            title: "Session Missed",
            message:
              "The scheduled therapy session was missed because the session was not joined.",
            sessionId: noShowSession._id,
          });
        }
      }
    } catch (error) {
      /**
       * Session status has already been updated successfully.
       * Notification failure should not rollback the session result.
       */
      console.error("Failed to create session no-show notifications:", error);
    }
  }

  return {
    completedCount,
    noShowCount,
  };
};

/* -------------------------------------------------------------------------- */
/*                           Get Client Profile                               */
/* -------------------------------------------------------------------------- */

const getClient = async (userId) => {
  const client = await Client.findOne({
    userId,
  }).select("_id userId");

  if (!client) {
    throw new ApiError(
      404,
      "Client profile not found.",
      "CLIENT_PROFILE_NOT_FOUND",
    );
  }

  return client;
};

/* -------------------------------------------------------------------------- */
/*                              Get Therapist                                 */
/* -------------------------------------------------------------------------- */

const getTherapist = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId).select(
    "_id userId name slug",
  );

  if (!therapist) {
    throw new ApiError(404, "Therapist not found.", "THERAPIST_NOT_FOUND");
  }

  return therapist;
};

/* -------------------------------------------------------------------------- */
/*                         Validate Session Date                              */
/* -------------------------------------------------------------------------- */

const validateSessionDate = (dateString) => {
  if (!isValidDateString(dateString)) {
    throw new ApiError(400, "Invalid session date.", "INVALID_SESSION_DATE");
  }

  const selectedDate = parseDate(dateString);
  const today = parseDate(getTodayDateString());

  if (selectedDate < today) {
    throw new ApiError(
      400,
      "Session date cannot be in the past.",
      "PAST_SESSION_DATE",
    );
  }

  return selectedDate;
};

/* -------------------------------------------------------------------------- */
/*                             Generate Slots                                 */
/* -------------------------------------------------------------------------- */

/**
 * Generate session start times from therapist availability.
 *
 * Example:
 *
 * Availability 10:00 - 11:00
 * Duration      15 min
 * Buffer         5 min
 *
 * Slots:
 * 10:00
 * 10:20
 * 10:40
 */
const generateSlots = ({ startTime, endTime, sessionDuration, bufferTime }) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const slots = [];

  let current = startMinutes;

  while (current + sessionDuration <= endMinutes) {
    slots.push(minutesToTime(current));

    current += sessionDuration + bufferTime;
  }

  return slots;
};

/* -------------------------------------------------------------------------- */
/*                        Filter Past Slots For Today                         */
/* -------------------------------------------------------------------------- */

/**
 * For today's date, remove slots that have already started.
 */
const filterPastSlotsForToday = (slots, dateString) => {
  if (!isToday(dateString)) {
    return slots;
  }

  const currentTimeMinutes = getCurrentTimeMinutes();

  return slots.filter((slot) => {
    const slotStartMinutes = timeToMinutes(slot);

    return slotStartMinutes > currentTimeMinutes;
  });
};

/* -------------------------------------------------------------------------- */
/*                         Get Available Slots                                */
/* -------------------------------------------------------------------------- */

const getAvailableSlots = async (therapistId, date) => {
  /* ---------------------------- Validate Date ---------------------------- */

  const selectedDate = validateSessionDate(date);

  /* -------------------------- Validate Therapist ------------------------- */

  await getTherapist(therapistId);

  /* ---------------------------- Day Of Week ------------------------------ */

  const dayOfWeek = getDayOfWeek(date);

  /* ------------------------- Get Weekly Schedule ------------------------- */

  const weeklyAvailability = await Availability.findOne({
    therapistId,
    type: "WEEKLY",
    dayOfWeek,
  }).lean();

  /* -------------------- Get One-Time Availability ------------------------ */

  const dateOverride = await Availability.findOne({
    therapistId,
    type: "OVERRIDE",
    date: selectedDate,
  }).lean();

  const blockedDate = await Availability.findOne({
    therapistId,
    type: "BLOCKED",
    date: selectedDate,
  }).lean();

  /* ----------------------- Blocked Date Priority ------------------------- */

  if (blockedDate) {
    return {
      date,
      dayOfWeek,
      sessionDuration:
        blockedDate.sessionDuration ??
        weeklyAvailability?.sessionDuration ??
        dateOverride?.sessionDuration ??
        null,
      bufferTime:
        blockedDate.bufferTime ??
        weeklyAvailability?.bufferTime ??
        dateOverride?.bufferTime ??
        null,
      price:
        blockedDate.price ??
        weeklyAvailability?.price ??
        dateOverride?.price ??
        null,
      slots: [],
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                         Effective Availability                           */
  /* ------------------------------------------------------------------------ */

  let effectiveAvailability = null;

  /**
   * Override always wins for that date.
   */
  if (dateOverride) {
    if (dateOverride.isAvailable) {
      effectiveAvailability = dateOverride;
    } else {
      effectiveAvailability = null;
    }
  } else if (weeklyAvailability?.isAvailable) {
    effectiveAvailability = weeklyAvailability;
  }

  /* ---------------------------- No Availability -------------------------- */

  if (!effectiveAvailability) {
    return {
      date,
      dayOfWeek,
      sessionDuration: null,
      bufferTime: null,
      price: null,
      slots: [],
    };
  }

  /* -------------------------- Availability Data --------------------------- */

  const sessionDuration = effectiveAvailability.sessionDuration;
  const bufferTime = effectiveAvailability.bufferTime;
  const price = effectiveAvailability.price;

  /* -------------------------- Generate Raw Slots -------------------------- */

  const rawSlots = generateSlots({
    startTime: effectiveAvailability.startTime,
    endTime: effectiveAvailability.endTime,
    sessionDuration,
    bufferTime,
  });

  /* ------------------------------------------------------------------------ */
  /*                         Today's Past Slot Filter                         */
  /* ------------------------------------------------------------------------ */

  const futureSlots = filterPastSlotsForToday(rawSlots, date);

  /* ---------------------- Get Already Booked Sessions --------------------- */

  const bookedSessions =
    await sessionRepository.findBookedSessionsByTherapistAndDate(
      therapistId,
      selectedDate,
    );

  const activeBookedSessions = bookedSessions.filter((session) =>
    ACTIVE_SESSION_STATUSES.includes(session.status),
  );

  /* ------------------------------------------------------------------------ */
  /*                     Remove Overlapping Slots                             */
  /* ------------------------------------------------------------------------ */

  const availableSlots = futureSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + sessionDuration;

    return !activeBookedSessions.some((session) => {
      const bookedStart = timeToMinutes(session.startTime);
      const bookedEnd = timeToMinutes(session.endTime);

      /*
       * A slot is unavailable when it overlaps
       * with an existing active session.
       *
       * Example:
       * Existing session: 04:45 - 05:25
       *
       * 05:10 - 05:20 -> blocked
       * 05:20 - 05:30 -> blocked
       * 05:30 - 05:40 -> allowed
       */
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  });

  return {
    date,
    dayOfWeek,
    sessionDuration,
    bufferTime,
    price,
    slots: availableSlots,
  };
};

/* -------------------------------------------------------------------------- */
/*                        Create Session / Book Slot                          */
/* -------------------------------------------------------------------------- */

const createSession = async ({ userId, therapistId, date, startTime }) => {
  /* ---------------------------- Get Client ------------------------------- */

  const client = await getClient(userId);

  /* -------------------------- Get Therapist ------------------------------- */

  await getTherapist(therapistId);

  /* ---------------------------- Validate Date ---------------------------- */

  const sessionDate = validateSessionDate(date);

  /* ---------------------- Get Current Available Slots -------------------- */

  const slotData = await getAvailableSlots(therapistId, date);

  /* ------------------------- Validate Requested Slot --------------------- */

  if (!slotData.slots.includes(startTime)) {
    throw new ApiError(
      409,
      "Selected time slot is no longer available.",
      "SLOT_NOT_AVAILABLE",
    );
  }

  /* ---------------------------- Calculate End ----------------------------- */

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + slotData.sessionDuration;

  const endTime = minutesToTime(endMinutes);

  /* ----------------------- Final Double-book Check ------------------------ */

  const existingSession =
    await sessionRepository.findActiveSessionByTherapistDateAndTime(
      therapistId,
      sessionDate,
      startTime,
    );

  if (existingSession) {
    throw new ApiError(
      409,
      "This time slot has already been booked.",
      "SLOT_ALREADY_BOOKED",
    );
  }

  /* ---------------------------- Create Session ---------------------------- */

  try {
    const session = await sessionRepository.createSession({
      clientId: client._id,
      therapistId,
      date: sessionDate,
      startTime,
      endTime,
      duration: slotData.sessionDuration,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentId: null,
      cancelledAt: null,
      cancelledBy: null,
      clientJoined: false,
      clientJoinedAt: null,
      therapistJoined: false,
      therapistJoinedAt: null,
    });

    return session;
  } catch (error) {
    /* ---------------------------------------------------------------------- */
    /*                    MongoDB Unique Index Protection                    */
    /* ---------------------------------------------------------------------- */

    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "This time slot has already been booked.",
        "SLOT_ALREADY_BOOKED",
      );
    }

    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                             Join Session                                   */
/* -------------------------------------------------------------------------- */

/**
 * Client and therapist both use this same function.
 *
 * userId comes from authenticated user.
 * sessionId comes from route params.
 *
 * Role is NOT accepted from request body.
 *
 * IMPORTANT:
 * Session remains IN_PROGRESS while the meeting is active.
 * The session is NOT marked COMPLETED when the second participant joins.
 *
 * It becomes COMPLETED only after the scheduled end time.
 */
const joinSession = async ({ userId, sessionId }) => {
  /* --------------------------- Find Session ------------------------------ */

  const session = await sessionRepository.findSessionById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.", "SESSION_NOT_FOUND");
  }

  /* -------------------------- Session Status ----------------------------- */

  if (session.status === "CANCELLED") {
    throw new ApiError(
      400,
      "Cancelled sessions cannot be joined.",
      "SESSION_CANCELLED",
    );
  }

  if (session.status === "COMPLETED") {
    throw new ApiError(
      400,
      "Completed sessions cannot be joined.",
      "SESSION_ALREADY_COMPLETED",
    );
  }

  if (session.status === "NO_SHOW") {
    throw new ApiError(
      400,
      "This session is marked as no-show.",
      "SESSION_NO_SHOW",
    );
  }

  if (session.status === "PENDING") {
    throw new ApiError(
      400,
      "Session is not confirmed yet.",
      "SESSION_NOT_CONFIRMED",
    );
  }

  /* ------------------------ Identify Participant ------------------------- */

  const client = await Client.findOne({
    userId,
  }).select("_id userId");

  const therapist = await Therapist.findOne({
    userId,
  }).select("_id userId name slug");

  /* ------------------------------------------------------------------------ */
  /*                    Normalize Therapist Session ID                        */
  /* ------------------------------------------------------------------------ */

  /**
   * findSessionById() populates therapistId.
   *
   * Therefore:
   * session.therapistId can be:
   *   - ObjectId
   *   - populated therapist object
   *
   * Always compare using the actual _id.
   */
  const sessionTherapistId = session?.therapistId?._id || session?.therapistId;

  const sessionClientId = session?.clientId?._id || session?.clientId;

  const isClient =
    client &&
    sessionClientId &&
    client._id.toString() === sessionClientId.toString();

  const isTherapist =
    therapist &&
    sessionTherapistId &&
    therapist._id.toString() === sessionTherapistId.toString();

  if (!isClient && !isTherapist) {
    throw new ApiError(
      403,
      "You are not allowed to join this session.",
      "SESSION_JOIN_ACCESS_DENIED",
    );
  }

  /* --------------------------- Time Validation --------------------------- */

  const now = new Date();

  const sessionStart = getSessionDateTime(session, "startTime");

  const sessionEnd = getSessionDateTime(session, "endTime");

  if (!sessionStart || !sessionEnd) {
    throw new ApiError(
      500,
      "Invalid session date or time configuration.",
      "INVALID_SESSION_DATETIME",
    );
  }

  /**
   * Join is allowed only between
   * session start and session end.
   */
  if (now < sessionStart) {
    throw new ApiError(
      400,
      "The session has not started yet.",
      "SESSION_NOT_STARTED",
    );
  }

  if (now >= sessionEnd) {
    throw new ApiError(400, "The session has already ended.", "SESSION_ENDED");
  }

  /* ------------------------------------------------------------------------ */
  /*                              CLIENT JOIN                                 */
  /* ------------------------------------------------------------------------ */

  if (isClient) {
    /* ------------------------ Already Joined ----------------------------- */

    /**
     * Do NOT reject a reconnect.
     *
     * The participant may have temporarily disconnected
     * from the actual video/socket layer and can reconnect
     * while the scheduled session is still active.
     */
    if (session.clientJoined) {
      return {
        session,
        participant: "CLIENT",
        alreadyJoined: true,
      };
    }

    /**
     * First client join or client joining after therapist.
     *
     * Either way the session remains IN_PROGRESS.
     *
     * NEVER mark COMPLETED here.
     */
    const updatedSession = await sessionRepository.updateSessionJoinStatus(
      sessionId,
      {
        clientJoined: true,
        clientJoinedAt: now,
        status: "IN_PROGRESS",
      },
    );

    return {
      session: updatedSession,
      participant: "CLIENT",
      alreadyJoined: false,
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                           THERAPIST JOIN                                 */
  /* ------------------------------------------------------------------------ */

  /**
   * Do NOT reject a reconnect.
   *
   * If therapistJoined is already true, the participant
   * can still re-enter the video room while the session
   * is within its scheduled time window.
   */
  if (session.therapistJoined) {
    return {
      session,
      participant: "THERAPIST",
      alreadyJoined: true,
    };
  }

  /**
   * First therapist join or therapist joining after client.
   *
   * The session remains IN_PROGRESS.
   *
   * NEVER mark COMPLETED here.
   */
  const updatedSession = await sessionRepository.updateSessionJoinStatus(
    sessionId,
    {
      therapistJoined: true,
      therapistJoinedAt: now,
      status: "IN_PROGRESS",
    },
  );

  return {
    session: updatedSession,
    participant: "THERAPIST",
    alreadyJoined: false,
  };
};

/* -------------------------------------------------------------------------- */
/*                            Get My Sessions                                 */
/* -------------------------------------------------------------------------- */

const getMySessions = async (userId) => {
  await completeExpiredSessions();

  const client = await getClient(userId);

  const sessions = await sessionRepository.findSessionsByClientId(client._id);

  const upcoming = [];
  const completed = [];
  const cancelled = [];

  for (const session of sessions) {
    /* ----------------------------- Cancelled ----------------------------- */

    if (session.status === "CANCELLED") {
      cancelled.push(session);
      continue;
    }

    /* ---------------------- Completed / No Show ------------------------- */

    if (session.status === "COMPLETED" || session.status === "NO_SHOW") {
      completed.push(session);
      continue;
    }

    /* --------------------------- Upcoming ------------------------------- */

    upcoming.push(session);
  }

  return {
    upcoming,
    completed,
    cancelled,
  };
};

/* -------------------------------------------------------------------------- */
/*                            Cancel Session                                  */
/* -------------------------------------------------------------------------- */

const cancelSession = async ({ userId, sessionId }) => {
  /* ---------------------------- Get Client ------------------------------- */

  const client = await getClient(userId);

  /* --------------------------- Find Session ------------------------------ */

  const session = await sessionRepository.findSessionById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.", "SESSION_NOT_FOUND");
  }

  /* --------------------------- Ownership Check --------------------------- */

  const sessionClientId = session?.clientId?._id || session?.clientId;

  if (
    !sessionClientId ||
    sessionClientId.toString() !== client._id.toString()
  ) {
    throw new ApiError(
      403,
      "You are not allowed to cancel this session.",
      "SESSION_ACCESS_DENIED",
    );
  }

  /* -------------------------- Already Cancelled -------------------------- */

  if (session.status === "CANCELLED") {
    throw new ApiError(
      409,
      "Session is already cancelled.",
      "SESSION_ALREADY_CANCELLED",
    );
  }

  /* -------------------------- Completed Session -------------------------- */

  if (session.status === "COMPLETED") {
    throw new ApiError(
      400,
      "Completed sessions cannot be cancelled.",
      "SESSION_ALREADY_COMPLETED",
    );
  }

  /* -------------------------- No-Show Session ---------------------------- */

  if (session.status === "NO_SHOW") {
    throw new ApiError(
      400,
      "No-show sessions cannot be cancelled.",
      "SESSION_ALREADY_NO_SHOW",
    );
  }

  /* -------------------------- In Progress ------------------------------- */

  if (session.status === "IN_PROGRESS") {
    throw new ApiError(
      400,
      "A session in progress cannot be cancelled.",
      "SESSION_IN_PROGRESS",
    );
  }

  /* ------------------------------ Cancel --------------------------------- */

  const cancelledSession = await sessionRepository.cancelSession(
    sessionId,
    "CLIENT",
  );

  /* ------------------------------------------------------------------------ */
  /*                       Session Cancelled Notifications                   */
  /* ------------------------------------------------------------------------ */

  try {
    const therapistId = session?.therapistId?._id || session?.therapistId;

    const therapist = await getTherapist(therapistId);

    /* --------------------------- Client ---------------------------------- */

    await notificationService.createNotification({
      recipientId: client.userId,
      type: "SESSION_CANCELLED",
      title: "Session Cancelled",
      message: "Your therapy session has been cancelled.",
      sessionId: cancelledSession._id,
    });

    /* --------------------------- Therapist ------------------------------- */

    await notificationService.createNotification({
      recipientId: therapist.userId,
      type: "SESSION_CANCELLED",
      title: "Session Cancelled",
      message: "A client has cancelled a therapy session with you.",
      sessionId: cancelledSession._id,
    });
  } catch (error) {
    console.error("Failed to create session cancelled notifications:", error);
  }

  return cancelledSession;
};

/* -------------------------------------------------------------------------- */
/*                           Get Session By ID                                */
/* -------------------------------------------------------------------------- */

const getSessionById = async ({ userId, sessionId }) => {
  /* ---------------------------- Get Client ------------------------------- */

  const client = await getClient(userId);

  /* --------------------------- Find Session ------------------------------ */

  const session = await sessionRepository.findSessionById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.", "SESSION_NOT_FOUND");
  }

  /* --------------------------- Ownership Check --------------------------- */

  const sessionClientId = session?.clientId?._id || session?.clientId;

  if (
    !sessionClientId ||
    sessionClientId.toString() !== client._id.toString()
  ) {
    throw new ApiError(
      403,
      "You are not allowed to access this session.",
      "SESSION_ACCESS_DENIED",
    );
  }

  return session;
};

/* -------------------------------------------------------------------------- */
/*                                 Export                                     */
/* -------------------------------------------------------------------------- */

module.exports = {
  getAvailableSlots,
  createSession,
  joinSession,
  getMySessions,
  cancelSession,
  getSessionById,
  completeExpiredSessions,
};
