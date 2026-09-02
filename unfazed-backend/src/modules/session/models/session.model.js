const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                              Session Schema                                */
/* -------------------------------------------------------------------------- */

const sessionSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------------------- */
    /*                                 Client                                 */
    /* ---------------------------------------------------------------------- */

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                                Therapist                               */
    /* ---------------------------------------------------------------------- */

    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: [true, "Therapist is required"],
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                              Session Date                              */
    /* ---------------------------------------------------------------------- */

    date: {
      type: Date,
      required: [true, "Session date is required"],
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                           Session Start Time                            */
    /* ---------------------------------------------------------------------- */

    startTime: {
      type: String,
      required: [true, "Session start time is required"],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Start time must be in HH:mm format.",
      ],
    },

    /* ---------------------------------------------------------------------- */
    /*                            Session End Time                             */
    /* ---------------------------------------------------------------------- */

    endTime: {
      type: String,
      required: [true, "Session end time is required"],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "End time must be in HH:mm format.",
      ],
    },

    /* ---------------------------------------------------------------------- */
    /*                            Session Duration                             */
    /* ---------------------------------------------------------------------- */

    duration: {
      type: Number,
      min: [1, "Session duration must be at least 1 minute."],
      max: [240, "Session duration cannot exceed 240 minutes."],
      required: [true, "Session duration is required"],
    },

    /* ---------------------------------------------------------------------- */
    /*                             Booking Status                              */
    /* ---------------------------------------------------------------------- */

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                             Payment Status                              */
    /* ---------------------------------------------------------------------- */

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                               Payment ID                                */
    /* ---------------------------------------------------------------------- */

    paymentId: {
      type: String,
      default: null,
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                                Cancellation                             */
    /* ---------------------------------------------------------------------- */

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["CLIENT", "THERAPIST", "SYSTEM", null],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* -------------------------------------------------------------------------- */
/*                           Prevent Double Booking                           */
/* -------------------------------------------------------------------------- */

sessionSchema.index(
  {
    therapistId: 1,
    date: 1,
    startTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    },
  },
);

/* -------------------------------------------------------------------------- */
/*                           Client Sessions Index                            */
/* -------------------------------------------------------------------------- */

sessionSchema.index({
  clientId: 1,
  date: 1,
  startTime: 1,
});

/* -------------------------------------------------------------------------- */
/*                         Therapist Sessions Index                           */
/* -------------------------------------------------------------------------- */

sessionSchema.index({
  therapistId: 1,
  date: 1,
  startTime: 1,
});

/* -------------------------------------------------------------------------- */
/*                                   Model                                    */
/* -------------------------------------------------------------------------- */

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
