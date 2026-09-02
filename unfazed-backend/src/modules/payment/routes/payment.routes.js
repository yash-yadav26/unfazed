const express = require("express");

const authMiddleware = require("../../../middleware/authMiddleware");

const {
  validateCreateOrder,
  validateVerifyPayment,
} = require("../validations/payment.validation");

const {
  createOrderController,
  verifyPaymentController,
  completePaymentController,
  getMyPaymentsController,
} = require("../controllers/payment.controller");

const router = express.Router();


/**
 * @swagger
 * /api/payment/my-payments:
 *   get:
 *     summary: Get logged-in client's payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/my-payments",
  authMiddleware,
  getMyPaymentsController
);


/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment and Razorpay APIs
 */

/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create Razorpay payment order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - therapistId
 *               - date
 *               - startTime
 *             properties:
 *               therapistId:
 *                 type: string
 *                 example: "66a123456789abcdef123456"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-08"
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *     responses:
 *       201:
 *         description: Razorpay order created successfully
 *       400:
 *         description: Validation or availability error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist or client profile not found
 *       409:
 *         description: Selected slot already booked
 *       502:
 *         description: Razorpay order creation failed
 */
router.post(
  "/create-order",
  authMiddleware,
  validateCreateOrder,
  createOrderController,
);

/**
 * @swagger
 * /api/payment/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               razorpayOrderId:
 *                 type: string
 *                 example: "order_RazorpayOrder123"
 *               razorpayPaymentId:
 *                 type: string
 *                 example: "pay_RazorpayPayment123"
 *               razorpaySignature:
 *                 type: string
 *                 example: "abcdef1234567890"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid payment signature or payment status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment record not found
 */
router.post(
  "/verify",
  authMiddleware,
  validateVerifyPayment,
  verifyPaymentController,
);

/**
 * @swagger
 * /api/payment/complete:
 *   post:
 *     summary: Verify payment and book session
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               razorpayOrderId:
 *                 type: string
 *                 example: "order_RazorpayOrder123"
 *               razorpayPaymentId:
 *                 type: string
 *                 example: "pay_RazorpayPayment123"
 *               razorpaySignature:
 *                 type: string
 *                 example: "abcdef1234567890"
 *     responses:
 *       200:
 *         description: Payment verified and session booked successfully
 *       400:
 *         description: Invalid payment or booking data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment or client profile not found
 *       409:
 *         description: Session slot is no longer available
 *       502:
 *         description: Payment provider verification error
 */
router.post(
  "/complete",
  authMiddleware,
  validateVerifyPayment,
  completePaymentController,
);

module.exports = router;
