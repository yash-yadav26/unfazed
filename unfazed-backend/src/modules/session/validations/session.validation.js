const mongoose = require("mongoose");

const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                              Common Schemas                                */
/* -------------------------------------------------------------------------- */

// MongoDB ObjectId
const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), "Invalid ID.");

// Date format: YYYY-MM-DD
const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Please provide a valid date.");

// Time format: HH:mm
const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format.");

/* -------------------------------------------------------------------------- */
/*                         Future Date Validation                             */
/* -------------------------------------------------------------------------- */

const isTodayOrFuture = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const selectedDate = new Date(year, month - 1, day);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate >= today;
};

/* -------------------------------------------------------------------------- */
/*                         Available Slots Query                              */
/* -------------------------------------------------------------------------- */

// GET /api/session/slots
//
// ?therapistId=...
// &date=2026-09-02

const getAvailableSlotsSchema = z
  .object({
    therapistId: objectIdSchema,
    date: dateSchema,
  })
  .strict()
  .refine(({ date }) => isTodayOrFuture(date), {
    path: ["date"],
    message: "Session date cannot be in the past.",
  });

/* -------------------------------------------------------------------------- */
/*                            Create Session                                  */
/* -------------------------------------------------------------------------- */

// POST /api/session
//
// {
//   therapistId,
//   date,
//   startTime
// }

const createSessionSchema = z
  .object({
    therapistId: objectIdSchema,
    date: dateSchema,
    startTime: timeSchema,
  })
  .strict()
  .refine(({ date }) => isTodayOrFuture(date), {
    path: ["date"],
    message: "Session date cannot be in the past.",
  });

/* -------------------------------------------------------------------------- */
/*                           Session ID Params                                */
/* -------------------------------------------------------------------------- */

// GET    /api/session/:id
// PATCH  /api/session/:id/cancel
// POST   /api/session/:id/join

const sessionIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

/* -------------------------------------------------------------------------- */
/*                         Validation Middleware                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Validators                                   */
/* -------------------------------------------------------------------------- */

// GET /api/session/slots

const validateGetAvailableSlots = parseRequestPart(
  getAvailableSlotsSchema,
  "query",
);

// POST /api/session

const validateCreateSession = parseRequestPart(createSessionSchema, "body");

// GET /api/session/:id

const validateSessionId = parseRequestPart(sessionIdParamsSchema, "params");

// PATCH /api/session/:id/cancel

const validateCancelSession = validateSessionId;

// POST /api/session/:id/join
//
// Join API bhi same session ID params use karegi.
// Request body ki zarurat nahi hai.

const validateJoinSession = validateSessionId;

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  // Validators
  validateGetAvailableSlots,
  validateCreateSession,
  validateSessionId,
  validateCancelSession,
  validateJoinSession,
};
