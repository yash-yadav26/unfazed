const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                           Availability Schema                              */
/* -------------------------------------------------------------------------- */

const availabilitySchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------------------- */
    /*                              Therapist                                 */
    /* ---------------------------------------------------------------------- */

    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: [true, "Therapist is required"],
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                           Availability Type                            */
    /* ---------------------------------------------------------------------- */

    type: {
      type: String,
      enum: ["WEEKLY", "OVERRIDE", "BLOCKED"],
      required: [true, "Availability type is required"],
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                           Weekly Schedule                               */
    /* ---------------------------------------------------------------------- */

    dayOfWeek: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
    },

    /* ---------------------------------------------------------------------- */
    /*                            One-Time Date                                */
    /* ---------------------------------------------------------------------- */

    date: {
      type: Date,
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                          Availability Status                            */
    /* ---------------------------------------------------------------------- */

    isAvailable: {
      type: Boolean,
      default: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                                  Time                                  */
    /* ---------------------------------------------------------------------- */

    startTime: {
      type: String,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Start time must be in HH:mm format.",
      ],
    },

    endTime: {
      type: String,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "End time must be in HH:mm format.",
      ],
    },

    /* ---------------------------------------------------------------------- */
    /*                           Session Configuration                         */
    /* ---------------------------------------------------------------------- */

    sessionDuration: {
      type: Number,
      min: [1, "Session duration must be at least 1 minute."],
      max: [240, "Session duration cannot exceed 240 minutes."],
      default: 15,
    },

    bufferTime: {
      type: Number,
      min: [0, "Buffer time cannot be negative."],
      max: [120, "Buffer time cannot exceed 120 minutes."],
      default: 5,
    },

    /* ---------------------------------------------------------------------- */
    /*                              Session Price                              */
    /* ---------------------------------------------------------------------- */

    price: {
      type: Number,
      min: [0, "Session price cannot be negative."],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* -------------------------------------------------------------------------- */
/*                         Weekly Availability Index                          */
/* -------------------------------------------------------------------------- */

/**
 * One WEEKLY entry per therapist per day.
 */

availabilitySchema.index(
  {
    therapistId: 1,
    type: 1,
    dayOfWeek: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "WEEKLY",
    },
  },
);

/* -------------------------------------------------------------------------- */
/*                           One-Time Date Index                              */
/* -------------------------------------------------------------------------- */

/**
 * One OVERRIDE or BLOCKED entry per therapist per date.
 */

availabilitySchema.index(
  {
    therapistId: 1,
    type: 1,
    date: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: {
        $in: ["OVERRIDE", "BLOCKED"],
      },
    },
  },
);

/* -------------------------------------------------------------------------- */
/*                                   Model                                    */
/* -------------------------------------------------------------------------- */

const Availability = mongoose.model("Availability", availabilitySchema);

module.exports = Availability;
