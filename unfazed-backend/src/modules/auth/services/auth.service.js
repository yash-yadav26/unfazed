const crypto = require("crypto");

const authRepository = require("../repositories/auth.repository");

const ApiError = require("../../../utils/apiError");

const { hashPassword, comparePassword } = require("../../../utils/password");

const { generateToken } = require("../../../utils/jwt");

const passwordResetTemplate = require("../../../templates/emails/passwordReset.template");

const { sendEmail } = require("../../../utils/email");

// ===============================
// Register User
// ===============================

const register = async ({ name, email, password, role }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists.",
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await authRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileCompleted: user.profileCompleted,
  };
};

// ===============================
// Login User
// ===============================

const login = async ({ email, password, role }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || user.role !== role) {
    throw new ApiError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS",
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS",
    );
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive.", "ACCOUNT_INACTIVE");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
    },
  };
};

// ===============================
// Forgot Password
// ===============================

const forgotPassword = async (email) => {
  const user = await authRepository.findUserForPasswordReset(email);

  // Keep same response whether user exists or not
  if (!user) {
    return;
  }

  // Generate 6 digit OTP
  const resetOtp = crypto.randomInt(100000, 1000000).toString();

  // OTP valid for 10 minutes
  const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Save OTP
  await authRepository.saveResetOtp(user._id, resetOtp, resetOtpExpiresAt);

  // Create email content
  const emailTemplate = passwordResetTemplate(resetOtp);

  // Send email
  await sendEmail({
    to: user.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  });
};

// ===============================
// Verify Reset OTP
// ===============================

const verifyResetOtp = async (email, otp) => {
  const user = await authRepository.findUserByEmailWithResetOtp(email);

  if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
    throw new ApiError(400, "Invalid or expired OTP.", "INVALID_RESET_OTP");
  }

  // Check OTP expiry
  if (new Date() > new Date(user.resetOtpExpiresAt)) {
    await authRepository.clearResetOtp(user._id);

    throw new ApiError(400, "OTP has expired.", "RESET_OTP_EXPIRED");
  }

  // Check OTP
  if (user.resetOtp !== otp) {
    throw new ApiError(400, "Invalid OTP.", "INVALID_RESET_OTP");
  }

  /*
   * OTP verified successfully.
   *
   * resetOtp + resetOtpExpiresAt clear
   * and passwordResetVerified true
   * in one database operation.
   */
  await authRepository.verifyAndClearResetOtp(user._id);
};

// ===============================
// Reset Password
// ===============================

const resetPassword = async (email, newPassword) => {
  const user =
    await authRepository.findUserByEmailWithPasswordResetState(email);

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  // OTP verification required
  if (!user.passwordResetVerified) {
    throw new ApiError(
      403,
      "Please verify the OTP first.",
      "RESET_OTP_NOT_VERIFIED",
    );
  }

  // Verified reset session valid for 10 minutes
  if (
    !user.passwordResetVerifiedAt ||
    Date.now() - new Date(user.passwordResetVerifiedAt).getTime() >
      10 * 60 * 1000
  ) {
    await authRepository.clearPasswordResetState(user._id);

    throw new ApiError(
      403,
      "Password reset session has expired. Please request a new OTP.",
      "RESET_SESSION_EXPIRED",
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password + clear reset state
  await authRepository.updatePasswordAndClearResetOtp(user._id, hashedPassword);
};

// ===============================
// Export
// ===============================

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
