const authService = require("../services/auth.service");

const ApiResponse = require("../../../utils/apiResponse");

const asyncHandler = require("../../../utils/asyncHandler");

// ===============================
// Register Controller
// ===============================

const registerController = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validatedBody);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Account created successfully."));
});

// ===============================
// Login Controller
// ===============================

const loginController = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validatedBody);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Login successful."));
});

// ===============================
// Forgot Password Controller
// ===============================

const forgotPasswordController = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.validatedBody.email);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If the account exists, a password reset OTP has been sent to the registered email.",
      ),
    );
});

// ===============================
// Verify OTP Controller
// ===============================

const verifyOtpController = asyncHandler(async (req, res) => {
  await authService.verifyResetOtp(
    req.validatedBody.email,
    req.validatedBody.otp,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP verified successfully."));
});

// ===============================
// Reset Password Controller
// ===============================

const resetPasswordController = asyncHandler(async (req, res) => {
  await authService.resetPassword(
    req.validatedBody.email,
    req.validatedBody.password,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully."));
});

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController,
};
