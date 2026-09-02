const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema(
  {
    /* =====================================================
       Session Reference
       -----------------------------------------------------
       Note kis session ka hai
    ====================================================== */

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, "Session is required"],
      index: true,
    },

    /* =====================================================
       Therapist Reference
       -----------------------------------------------------
       Note kis therapist ne create kiya
    ====================================================== */

    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: [true, "Therapist is required"],
      index: true,
    },

    /* =====================================================
       Client Reference
       -----------------------------------------------------
       Note kis client se related hai
    ====================================================== */

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
      index: true,
    },

    /* =====================================================
       Note Type
       -----------------------------------------------------
       PRIVATE -> Sirf therapist
       SHARED  -> Therapist + Client
    ====================================================== */

    type: {
      type: String,
      enum: {
        values: ["PRIVATE", "SHARED"],
        message: "Note type must be either PRIVATE or SHARED.",
      },
      required: [true, "Note type is required"],
      default: "PRIVATE",
      index: true,
    },

    /* =====================================================
       Note Content
    ====================================================== */

    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      minlength: [1, "Note content cannot be empty."],
      maxlength: [10000, "Note content cannot exceed 10000 characters."],
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

/* =========================================================
   Indexes
========================================================= */

/*
 * Session ke notes quickly fetch karne ke liye.
 */
notesSchema.index({
  sessionId: 1,
  createdAt: -1,
});

/*
 * Therapist ke kisi particular session ke notes
 * quickly fetch karne ke liye.
 */
notesSchema.index({
  therapistId: 1,
  sessionId: 1,
  createdAt: -1,
});

/*
 * Client ke shared notes quickly fetch karne ke liye.
 */
notesSchema.index({
  clientId: 1,
  type: 1,
  createdAt: -1,
});

/* =========================================================
   Model
========================================================= */

const Notes = mongoose.model("Notes", notesSchema);

module.exports = Notes;
