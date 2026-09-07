const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------------------- */
    /*                              Sender                                    */
    /* ---------------------------------------------------------------------- */

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["CLIENT", "THERAPIST"],
      required: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                             Receiver                                   */
    /* ---------------------------------------------------------------------- */

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    receiverType: {
      type: String,
      enum: ["CLIENT", "THERAPIST"],
      required: true,
    },

    /* ---------------------------------------------------------------------- */
    /*                              Message                                   */
    /* ---------------------------------------------------------------------- */

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    /* ---------------------------------------------------------------------- */
    /*                              Read Status                                */
    /* ---------------------------------------------------------------------- */

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/* -------------------------------------------------------------------------- */
/*                         Chat History Index                                 */
/* -------------------------------------------------------------------------- */

/**
 * Helps fetch conversation history efficiently
 * between Client and Therapist.
 */
messageSchema.index({
  senderId: 1,
  senderType: 1,
  receiverId: 1,
  receiverType: 1,
  createdAt: -1,
});

/* -------------------------------------------------------------------------- */
/*                         Unread Messages Index                              */
/* -------------------------------------------------------------------------- */

/**
 * Helps count/fetch unread messages received by
 * a specific Client or Therapist.
 */
messageSchema.index({
  receiverId: 1,
  receiverType: 1,
  isRead: 1,
  createdAt: -1,
});

/* -------------------------------------------------------------------------- */
/*                           Message Model                                    */
/* -------------------------------------------------------------------------- */

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
