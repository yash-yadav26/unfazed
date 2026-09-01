const express = require("express");

const {
  registerController,
  loginController,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController,
} = require("../controllers/auth.controller");

const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
} = require("../validations/auth.validation");

const router = express.Router();

// ===============================
// Register
// ===============================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yash Yadav
 *               email:
 *                 type: string
 *                 format: email
 *                 example: yash@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum:
 *                   - CLIENT
 *                   - THERAPIST
 *                 example: CLIENT
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email already exists
 */
router.post("/register", validateRegister, registerController);

// ===============================
// Login
// ===============================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: yash@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum:
 *                   - CLIENT
 *                   - THERAPIST
 *                 example: CLIENT
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid email, password, or role
 *       403:
 *         description: Account is inactive
 */
router.post("/login", validateLogin, loginController);

// ===============================
// Forgot Password
// ===============================

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: yash@gmail.com
 *     responses:
 *       200:
 *         description: Password reset OTP request processed
 *       400:
 *         description: Validation failed
 */
router.post(
  "/forgot-password",
  validateForgotPassword,
  forgotPasswordController,
);

// ===============================
// Verify OTP
// ===============================

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: yash@gmail.com
 *               otp:
 *                 type: string
 *                 example: "482193"
 *                 description: Six digit OTP sent to the registered email
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", validateVerifyOtp, verifyOtpController);

// ===============================
// Reset Password
// ===============================

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: yash@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: OTP has not been verified or reset session expired
 *       404:
 *         description: User not found
 */
router.post("/reset-password", validateResetPassword, resetPasswordController);

module.exports = router;
