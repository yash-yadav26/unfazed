const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                              Notification Types                            */
/* -------------------------------------------------------------------------- */

const NOTIFICATION_TYPES = {
  SESSION_BOOKED: "SESSION_BOOKED",
  SESSION_COMPLETED: "SESSION_COMPLETED",
  SESSION_CANCELLED: "SESSION_CANCELLED",
  SESSION_REMINDER: "SESSION_REMINDER",
  NOTE_SHARED: "NOTE_SHARED",
};

/* -------------------------------------------------------------------------- */
/*                            Notification Schema                             */
/* -------------------------------------------------------------------------- */

const notificationSchema = new mongoose.Schema(
  {
    /*
     * Notification kis user ko milegi.
     *
     * Client aur Therapist dono User collection mein hain,
     * isliye yahan User ka _id store karenge.
     */
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Notification kis event ki wajah se create hui.
     */
    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: "Invalid notification type.",
      },
      required: true,
      index: true,
    },

    /*
     * Notification ka heading.
     */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    /*
     * User ko dikhne wala actual message.
     */
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    /*
     * Session related notification ke liye.
     *
     * Example:
     * SESSION_BOOKED
     * SESSION_COMPLETED
     * SESSION_CANCELLED
     * SESSION_REMINDER
     */
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
      index: true,
    },

    /*
     * NOTE_SHARED notification ke liye.
     */
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notes",
      default: null,
      index: true,
    },

    /*
     * Notification read hui ya nahi.
     *
     * false -> unread
     * true  -> read
     */
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    /*
     * Notification kab read hui.
     *
     * Unread -> null
     * Read   -> actual date
     */
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* -------------------------------------------------------------------------- */
/*                                  Indexes                                   */
/* -------------------------------------------------------------------------- */

/*
 * User ki notifications latest first fetch karne ke liye.
 */
notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

/*
 * User ki unread notifications quickly fetch karne ke liye.
 */
notificationSchema.index({
  recipientId: 1,
  isRead: 1,
  createdAt: -1,
});

/*
 * Same session ki notifications ko efficiently query karne ke liye.
 */
notificationSchema.index({
  sessionId: 1,
  createdAt: -1,
});

/*
 * Prevent duplicate SESSION_REMINDER notifications
 * for the same user and same session.
 *
 * Example:
 *
 * Client + Session A + SESSION_REMINDER
 *         ↓
 * Only one reminder allowed.
 *
 * Therapist + Session A + SESSION_REMINDER
 *         ↓
 * One separate reminder allowed.
 *
 * Client and Therapist therefore each get exactly one reminder.
 */
notificationSchema.index(
  {
    recipientId: 1,
    sessionId: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "SESSION_REMINDER",
      sessionId: {
        $type: "objectId",
      },
    },
  },
);

/* -------------------------------------------------------------------------- */
/*                                   Model                                    */
/* -------------------------------------------------------------------------- */

const Notification = mongoose.model("Notification", notificationSchema);

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = Notification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
