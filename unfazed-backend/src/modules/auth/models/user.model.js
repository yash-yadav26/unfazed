const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["CLIENT", "THERAPIST"],
      required: [true, "Role is required"],
      index: true,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ===============================
    // Password Reset OTP
    // ===============================

    resetOtp: {
      type: String,
      default: null,
      select: false,
    },

    resetOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ===============================
    // Password Reset Verification
    // ===============================

    passwordResetVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    passwordResetVerifiedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;