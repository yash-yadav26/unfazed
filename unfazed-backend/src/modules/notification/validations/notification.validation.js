const mongoose = require("mongoose");

const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                              Common Schemas                                */
/* -------------------------------------------------------------------------- */

// Validates MongoDB ObjectId.
const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), "Invalid ID.");

/* -------------------------------------------------------------------------- */
/*                           Notification Query                               */
/* -------------------------------------------------------------------------- */

/*
 * GET /api/notifications
 *
 * Optional query:
 * ?isRead=true
 * ?isRead=false
 */
const getNotificationsQuerySchema = z
  .object({
    isRead: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
  .strict();

/* -------------------------------------------------------------------------- */
/*                          Notification ID Params                            */
/* -------------------------------------------------------------------------- */

/*
 * PATCH /api/notifications/:id/read
 *
 * DELETE /api/notifications/:id
 * (future use if needed)
 */
const notificationIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

/* -------------------------------------------------------------------------- */
/*                         Mark Notification Read                             */
/* -------------------------------------------------------------------------- */

/*
 * PATCH /api/notifications/:id/read
 *
 * No request body required.
 *
 * We only validate the notification ID.
 */

/* -------------------------------------------------------------------------- */
/*                          Mark All Notifications                            */
/* -------------------------------------------------------------------------- */

/*
 * PATCH /api/notifications/read-all
 *
 * No body required.
 */

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
/*                                Validators                                  */
/* -------------------------------------------------------------------------- */

/*
 * GET /api/notifications
 */
const validateGetNotifications = parseRequestPart(
  getNotificationsQuerySchema,
  "query",
);

/*
 * PATCH /api/notifications/:id/read
 */
const validateNotificationId = parseRequestPart(
  notificationIdParamsSchema,
  "params",
);

module.exports = {
  validateGetNotifications,
  validateNotificationId,
};
