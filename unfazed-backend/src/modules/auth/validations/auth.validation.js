const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

// ===============================
// Register Schema
// ===============================

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name must be at least 1 characters.")
      .max(100, "Name cannot exceed 100 characters."),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email.")
      .transform((value) => value.toLowerCase()),

    password: z.string().min(6, "Password must be at least 6 characters."),

    confirmPassword: z.string().min(1, "Confirm password is required."),

    role: z.enum(["CLIENT", "THERAPIST"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

// ===============================
// Login Schema
// ===============================

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email.")
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1, "Password is required."),

  role: z.enum(["CLIENT", "THERAPIST"]),
});

// ===============================
// Forgot Password Schema
// ===============================

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email.")
    .transform((value) => value.toLowerCase()),
});

// ===============================
// Verify OTP Schema
// ===============================

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email.")
    .transform((value) => value.toLowerCase()),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
});

// ===============================
// Reset Password Schema
// ===============================

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email.")
      .transform((value) => value.toLowerCase()),

    password: z.string().min(6, "Password must be at least 6 characters."),

    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

// ===============================
// Validation Middleware
// ===============================

const parseRequestPart = (schema, key) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[key]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path,
        message: issue.message,
      }));

      return next(
        new ApiError(400, "Validation failed", "VALIDATION_ERROR", errors),
      );
    }

    req[`validated${key.charAt(0).toUpperCase()}${key.slice(1)}`] = result.data;

    next();
  };
};

// ===============================
// Validators
// ===============================

const validateRegister = parseRequestPart(registerSchema, "body");

const validateLogin = parseRequestPart(loginSchema, "body");

const validateForgotPassword = parseRequestPart(forgotPasswordSchema, "body");

const validateVerifyOtp = parseRequestPart(verifyOtpSchema, "body");

const validateResetPassword = parseRequestPart(resetPasswordSchema, "body");

// ===============================
// Exports
// ===============================

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
};
