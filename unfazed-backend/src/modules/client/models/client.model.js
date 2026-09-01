const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 1,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: [true, "Gender is required"],
    },

    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      trim: true,
      maxlength: 100,
    },

    presentingConcern: {
      type: String,
      required: [true, "Presenting concern is required"],
      trim: true,
      maxlength: 2000,
    },

    relevantHistory: {
      type: String,
      required: [true, "Relevant history is required"],
      trim: true,
      maxlength: 4000,
    },

    consent: {
      type: Boolean,
      required: [true, "Consent is required"],
      default: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
