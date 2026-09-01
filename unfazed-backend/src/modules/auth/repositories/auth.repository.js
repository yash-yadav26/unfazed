const User = require("../models/user.model");

// ===============================
// Find User by Email
// ===============================

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

// ===============================
// Create User
// ===============================

const createUser = async (userData) => {
  return await User.create(userData);
};

// ===============================
// Find User for Password Reset
// ===============================

const findUserForPasswordReset = async (email) => {
  return await User.findOne({ email });
};

// ===============================
// Save Reset OTP
// ===============================

const saveResetOtp = async (userId, resetOtp, resetOtpExpiresAt) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      resetOtp,
      resetOtpExpiresAt,
      passwordResetVerified: false,
      passwordResetVerifiedAt: null,
    },
    {
      returnDocument: "after",
    },
  );
};

// ===============================
// Find User with Reset OTP
// ===============================

const findUserByEmailWithResetOtp = async (email) => {
  return await User.findOne({ email }).select("+resetOtp +resetOtpExpiresAt");
};

// ===============================
// Clear Reset OTP
// ===============================

const clearResetOtp = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      resetOtp: null,
      resetOtpExpiresAt: null,
    },
    {
      returnDocument: "after",
    },
  );
};

// ===============================
// Verify OTP + Clear OTP
// ===============================

const verifyAndClearResetOtp = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      resetOtp: null,
      resetOtpExpiresAt: null,
      passwordResetVerified: true,
      passwordResetVerifiedAt: new Date(),
    },
    {
      returnDocument: "after",
    },
  );
};

// ===============================
// Find User with Password Reset State
// ===============================

const findUserByEmailWithPasswordResetState = async (email) => {
  return await User.findOne({ email }).select(
    "+passwordResetVerified +passwordResetVerifiedAt",
  );
};

// ===============================
// Clear Password Reset State
// ===============================

const clearPasswordResetState = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      passwordResetVerified: false,
      passwordResetVerifiedAt: null,
      resetOtp: null,
      resetOtpExpiresAt: null,
    },
    {
      returnDocument: "after",
    },
  );
};

// ===============================
// Update Password
// ===============================

const updatePassword = async (userId, newPassword) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      password: newPassword,
    },
    {
      returnDocument: "after",
    },
  );
};

// ===============================
// Update Password + Clear Reset State
// ===============================

const updatePasswordAndClearResetOtp = async (userId, newPassword) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      password: newPassword,
      resetOtp: null,
      resetOtpExpiresAt: null,
      passwordResetVerified: false,
      passwordResetVerifiedAt: null,
    },
    {
      returnDocument: "after",
    },
  );
};

// ===============================
// Export
// ===============================

module.exports = {
  findUserByEmail,
  createUser,

  findUserForPasswordReset,
  saveResetOtp,
  findUserByEmailWithResetOtp,
  clearResetOtp,
  verifyAndClearResetOtp,

  findUserByEmailWithPasswordResetState,
  clearPasswordResetState,

  updatePassword,
  updatePasswordAndClearResetOtp,
};
