const Availability = require("../../scheduling/models/availability.model");
const Therapist = require("../../therapist/models/therapist.model");
const Client = require("../../client/models/client.model");

const notificationService = require("../../notification/services/notification.service");

const sessionRepository = require("../repositories/session.repository");
const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sessions with these statuses occupy a therapist's slot.
 */
const ACTIVE_SESSION_STATUSES = ["PENDING", "CONFIRMED"];

/**
 * Application timezone.
 *
 * Availability/session times are entered as local clock times,
 * so today's slot filtering should also use the same timezone.
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
 * Get today's date in the application timezone as YYYY-MM-DD.
 *
 * Example:
 * Asia/Kolkata current date -> "2026-09-02"
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
 * Check whether selected date is today in application timezone.
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

  return `${String(hours).padStart(
    2,
    "0",
  )}:${String(minutes).padStart(2, "0")}`;
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
 *
 * Example:
 *
 * Current time = 16:00
 *
 * 15:00 -> removed
 * 15:30 -> removed
 * 16:00 -> removed
 * 16:30 -> kept
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

  /* -------------------------- Get Day Of Week ----------------------------- */

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
   * If an override exists, it always wins for that date.
   *
   * Example:
   *
   * Weekly Wednesday = 10:00 - 18:00
   * Override date     = 10:00 - 16:00
   *
   * That specific Wednesday uses 10:00 - 16:00.
   *
   * If override isAvailable is false, that date has no slots.
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

  const bookedSlots = new Set(
    bookedSessions
      .filter((session) => ACTIVE_SESSION_STATUSES.includes(session.status))
      .map((session) => session.startTime),
  );

  /* ------------------------- Remove Booked Slots -------------------------- */

  const availableSlots = futureSlots.filter((slot) => !bookedSlots.has(slot));

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
    });

    return session;
  } catch (error) {
    /* ---------------------------------------------------------------------- */
    /*                    MongoDB Unique Index Protection                    */
    /* ---------------------------------------------------------------------- */

    /**
     * Pre-check is not enough because two clients can request
     * the same slot at exactly the same time.
     *
     * The MongoDB unique index is the final protection.
     */

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
/*                            Get My Sessions                                 */
/* -------------------------------------------------------------------------- */

const getMySessions = async (userId) => {
  const client = await getClient(userId);

  const sessions = await sessionRepository.findSessionsByClientId(client._id);

  const now = new Date();

  const upcoming = [];
  const completed = [];
  const cancelled = [];

  for (const session of sessions) {
    /* ----------------------------- Cancelled ----------------------------- */

    if (session.status === "CANCELLED") {
      cancelled.push(session);
      continue;
    }

    /* ------------------------- Session DateTime -------------------------- */

    const sessionDate = new Date(session.date);

    const [hours, minutes] = session.startTime.split(":").map(Number);

    sessionDate.setUTCHours(hours, minutes, 0, 0);

    /* --------------------- Upcoming / Completed -------------------------- */

    if (session.status === "COMPLETED" || sessionDate < now) {
      completed.push(session);
    } else {
      upcoming.push(session);
    }
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

  if (session.clientId.toString() !== client._id.toString()) {
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

  /* ------------------------------ Cancel --------------------------------- */

  const cancelledSession = await sessionRepository.cancelSession(
    sessionId,
    "CLIENT",
  );

  /* ------------------------------------------------------------------------ */
  /*                       Session Cancelled Notifications                   */
  /* ------------------------------------------------------------------------ */

  /*
   * Cancellation is successful at this point.
   *
   * Client and therapist both receive a notification.
   *
   * Notification failure should not make the already successful
   * cancellation fail.
   */
  try {
    const therapist = await getTherapist(session.therapistId);

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

  if (session.clientId.toString() !== client._id.toString()) {
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
  getMySessions,
  cancelSession,
  getSessionById,
};
