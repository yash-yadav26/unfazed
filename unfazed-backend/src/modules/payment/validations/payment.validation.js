const mongoose = require("mongoose");
const { z } = require("zod");

/* -------------------------------------------------------------------------- */
/*                                Common Schema                               */
/* -------------------------------------------------------------------------- */

// Validates MongoDB ObjectId.
const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid MongoDB ObjectId.",
  });

/* -------------------------------------------------------------------------- */
/*                            Create Order Schema                             */
/* -------------------------------------------------------------------------- */

/*
 * Client will send:
 *
 * {
 *   therapistId,
 *   date,
 *   startTime
 * }
 *
 * Amount is NOT accepted from client because the backend
 * should calculate the actual session price from availability.
 */

const createOrderSchema = z
  .object({
    therapistId: objectIdSchema,

    date: z
      .string()
      .min(1, "Session date is required.")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Invalid session date.",
      }),

    startTime: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Start time must be in HH:mm format.",
      ),
  })
  .strict();

/* -------------------------------------------------------------------------- */
/*                            Verify Payment Schema                           */
/* -------------------------------------------------------------------------- */

/*
 * Razorpay sends these values after successful checkout.
 *
 * {
 *   razorpayOrderId,
 *   razorpayPaymentId,
 *   razorpaySignature
 * }
 */

const verifyPaymentSchema = z
  .object({
    razorpayOrderId: z.string().min(1, "Razorpay order ID is required.").trim(),

    razorpayPaymentId: z
      .string()
      .min(1, "Razorpay payment ID is required.")
      .trim(),

    razorpaySignature: z
      .string()
      .min(1, "Razorpay payment signature is required.")
      .trim(),
  })
  .strict();

/* -------------------------------------------------------------------------- */
/*                              Request Middleware                             */
/* -------------------------------------------------------------------------- */

const parseRequestPart =
  (schema, part = "body") =>
  (req, res, next) => {
    try {
      const result = schema.safeParse(req[part]);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Validation failed.",
          errors: result.error.issues,
        });
      }

      req[`validated${part.charAt(0).toUpperCase()}${part.slice(1)}`] =
        result.data;

      next();
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------------------------- */
/*                              Export Validators                             */
/* -------------------------------------------------------------------------- */

const validateCreateOrder = parseRequestPart(createOrderSchema, "body");

const validateVerifyPayment = parseRequestPart(verifyPaymentSchema, "body");

module.exports = {
  validateCreateOrder,
  validateVerifyPayment,
};
