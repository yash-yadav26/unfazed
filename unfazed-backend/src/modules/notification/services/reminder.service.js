const Session = require("../../session/models/session.model");

const Client = require("../../client/models/client.model");

const Therapist = require("../../therapist/models/therapist.model");

const notificationService = require("./notification.service");

const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const APP_TIMEZONE = "Asia/Kolkata";

/*
 * Reminder window.
 *
 * Cron agar har 5 minutes chalega, to hum current time se
 * next 60 minutes ke andar aane wale confirmed sessions ko check karenge.
 */
const REMINDER_WINDOW_MINUTES = 60;

/* -------------------------------------------------------------------------- */
/*                           Timezone Helpers                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get current date/time parts in Asia/Kolkata.
 *
 * Returns:
 *
 * {
 *   year,
 *   month,
 *   day,
 *   hour,
 *   minute
 * }
 */
const getCurrentTimeParts = () => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());

  const getPart = (type) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
  };
};

/* -------------------------------------------------------------------------- */
/*                          Session DateTime Helper                           */
/* -------------------------------------------------------------------------- */

/**
 * Convert session date + startTime into a comparable timestamp.
 *
 * Session date database mein UTC midnight par stored hai.
 * startTime local clock time hai.
 *
 * Example:
 *
 * date      = 2026-09-02
 * startTime = 18:00
 *
 * becomes the 18:00 Asia/Kolkata session time.
 */
const getSessionDateTime = (session) => {
  const sessionDate = new Date(session.date);

  const [hours, minutes] = session.startTime.split(":").map(Number);

  /*
   * Database date UTC midnight represent karta hai.
   *
   * India timezone UTC+05:30 hai.
   *
   * Isliye UTC timestamp mein 18:00 IST ko represent karne ke
   * liye 12:30 UTC hota hai.
   */
  const utcTimestamp = Date.UTC(
    sessionDate.getUTCFullYear(),
    sessionDate.getUTCMonth(),
    sessionDate.getUTCDate(),
    hours,
    minutes,
  );

  /*
   * Convert local IST clock to UTC by subtracting 5:30 hours.
   */
  const IST_OFFSET_MINUTES = 330;

  return new Date(utcTimestamp - IST_OFFSET_MINUTES * 60 * 1000);
};

/* -------------------------------------------------------------------------- */
/*                       Check Reminder Window                                */
/* -------------------------------------------------------------------------- */

/**
 * Returns true when the session starts within the reminder window.
 *
 * Example:
 *
 * Current time = 05:00 PM
 * Session       = 06:00 PM
 *
 * Difference = 60 minutes
 * => reminder should be sent.
 */
const isSessionWithinReminderWindow = (session, currentTime) => {
  const sessionDateTime = getSessionDateTime(session);

  const differenceInMilliseconds =
    sessionDateTime.getTime() - currentTime.getTime();

  const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

  return (
    differenceInMinutes > 0 && differenceInMinutes <= REMINDER_WINDOW_MINUTES
  );
};

/* -------------------------------------------------------------------------- */
/*                      Get Current Application Time                          */
/* -------------------------------------------------------------------------- */

const getApplicationNow = () => {
  const parts = getCurrentTimeParts();

  /*
   * Create the equivalent UTC timestamp for local IST time.
   */
  const IST_OFFSET_MINUTES = 330;

  const utcTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );

  return new Date(utcTimestamp - IST_OFFSET_MINUTES * 60 * 1000);
};

/* -------------------------------------------------------------------------- */
/*                     Find Sessions To Remind                                */
/* -------------------------------------------------------------------------- */

const findSessionsForReminder = async () => {
  const now = getApplicationNow();

  /*
   * Sirf CONFIRMED sessions reminder ke eligible honge.
   *
   * PENDING session abhi booked/confirmed nahi maana jayega.
   */
  const sessions = await Session.find({
    status: "CONFIRMED",
  })
    .select("_id clientId therapistId date startTime endTime duration status")
    .lean();

  return sessions.filter((session) =>
    isSessionWithinReminderWindow(session, now),
  );
};

/* -------------------------------------------------------------------------- */
/*                         Send Session Reminder                              */
/* -------------------------------------------------------------------------- */

const sendSessionReminder = async (session) => {
  const client = await Client.findById(session.clientId)
    .select("_id userId")
    .lean();

  if (!client) {
    throw new ApiError(
      404,
      "Client profile not found.",
      "CLIENT_PROFILE_NOT_FOUND",
    );
  }

  const therapist = await Therapist.findById(session.therapistId)
    .select("_id userId name")
    .lean();

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "THERAPIST_PROFILE_NOT_FOUND",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                          Client Notification                             */
  /* ------------------------------------------------------------------------ */

  await notificationService.createNotification({
    recipientId: client.userId,
    type: "SESSION_REMINDER",
    title: "Session Reminder",
    message: "Your therapy session starts in 1 hour.",
    sessionId: session._id,
  });

  /* ------------------------------------------------------------------------ */
  /*                         Therapist Notification                           */
  /* ------------------------------------------------------------------------ */

  await notificationService.createNotification({
    recipientId: therapist.userId,
    type: "SESSION_REMINDER",
    title: "Session Reminder",
    message: "Your therapy session starts in 1 hour.",
    sessionId: session._id,
  });
};

/* -------------------------------------------------------------------------- */
/*                   Send Upcoming Session Reminders                          */
/* -------------------------------------------------------------------------- */

/**
 * Main function called by the cron job.
 *
 * This function:
 *
 * 1. Finds confirmed sessions.
 * 2. Checks which sessions are within 1 hour.
 * 3. Sends reminder to client.
 * 4. Sends reminder to therapist.
 *
 * Duplicate reminder protection Notification model ke
 * unique partial index se handle hoga.
 */
const sendUpcomingSessionReminders = async () => {
  const sessions = await findSessionsForReminder();

  if (!sessions.length) {
    return {
      processed: 0,
      remindersSent: 0,
    };
  }

  let remindersSent = 0;

  for (const session of sessions) {
    try {
      await sendSessionReminder(session);

      remindersSent += 1;
    } catch (error) {
      /*
       * Ek session ki notification fail hone par
       * baaki sessions process hona continue karenge.
       */
      console.error(
        `Failed to send reminder for session ${session._id}:`,
        error,
      );
    }
  }

  return {
    processed: sessions.length,
    remindersSent,
  };
};

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  sendUpcomingSessionReminders,
};
