const mongoose = require("mongoose");
const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                              Common Schemas                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------- ObjectId -------------------------------- */

const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), "Invalid ID.");

/* --------------------------------- Time ----------------------------------- */

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format.");

/* --------------------------- Availability Type --------------------------- */

const availabilityTypeSchema = z.enum(["WEEKLY", "OVERRIDE", "BLOCKED"], {
  message: "Type must be WEEKLY, OVERRIDE, or BLOCKED.",
});

/* ------------------------------- Day -------------------------------------- */

const dayOfWeekSchema = z.enum(
  [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ],
  {
    message: "Invalid day of week.",
  },
);

/* ------------------------- Session Duration ------------------------------- */

/**
 * Therapist can choose any whole-number session duration
 * between 1 and 240 minutes.
 *
 * Examples:
 * 15, 30, 45, 60, 90, 120
 */

const sessionDurationSchema = z.coerce
  .number()
  .int("Session duration must be a whole number.")
  .min(1, "Session duration must be at least 1 minute.")
  .max(240, "Session duration cannot exceed 240 minutes.");

/* ----------------------------- Buffer Time -------------------------------- */

/**
 * Therapist can choose any whole-number buffer
 * between 0 and 120 minutes.
 *
 * Examples:
 * 0, 5, 10, 15, 30, 45, 60
 */

const bufferTimeSchema = z.coerce
  .number()
  .int("Buffer time must be a whole number.")
  .min(0, "Buffer time cannot be negative.")
  .max(120, "Buffer time cannot exceed 120 minutes.");

/* -------------------------------- Price ----------------------------------- */

const priceSchema = z.coerce
  .number()
  .finite("Price must be a valid number.")
  .min(0, "Price cannot be negative.");

/* -------------------------------------------------------------------------- */
/*                         Base Availability Schema                           */
/* -------------------------------------------------------------------------- */

const baseAvailabilitySchema = z.object({
  type: availabilityTypeSchema,

  dayOfWeek: dayOfWeekSchema.optional(),

  date: z.coerce.date().optional(),

  isAvailable: z.boolean().default(true),

  startTime: timeSchema.optional(),

  endTime: timeSchema.optional(),

  sessionDuration: sessionDurationSchema.default(15),

  bufferTime: bufferTimeSchema.default(5),

  price: priceSchema.optional(),
});

/* -------------------------------------------------------------------------- */
/*                           Time Range Validation                             */
/* -------------------------------------------------------------------------- */

const validateTimeRange = (data, ctx) => {
  if (!data.startTime || !data.endTime) {
    return;
  }

  const [startHour, startMinute] = data.startTime.split(":").map(Number);

  const [endHour, endMinute] = data.endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "End time must be later than start time.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                             Create Rules                                   */
/* -------------------------------------------------------------------------- */

const validateCreateRules = (data, ctx) => {
  /* ------------------------------------------------------------------------ */
  /*                                  WEEKLY                                  */
  /* ------------------------------------------------------------------------ */

  if (data.type === "WEEKLY") {
    if (!data.dayOfWeek) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfWeek"],
        message: "Day of week is required for weekly availability.",
      });
    }

    if (data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Date is not allowed for weekly availability.",
      });
    }

    if (data.isAvailable) {
      if (!data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startTime"],
          message: "Start time is required when availability is enabled.",
        });
      }

      if (!data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "End time is required when availability is enabled.",
        });
      }

      if (data.price === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Session price is required when availability is enabled.",
        });
      }
    }

    validateTimeRange(data, ctx);
  }

  /* ------------------------------------------------------------------------ */
  /*                                 OVERRIDE                                 */
  /* ------------------------------------------------------------------------ */

  if (data.type === "OVERRIDE") {
    if (!data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Date is required for an override.",
      });
    }

    if (data.dayOfWeek) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfWeek"],
        message: "Day of week is not allowed for an override.",
      });
    }

    if (data.isAvailable) {
      if (!data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startTime"],
          message: "Start time is required for an available override.",
        });
      }

      if (!data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "End time is required for an available override.",
        });
      }

      if (data.price === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Session price is required for an available override.",
        });
      }
    }

    validateTimeRange(data, ctx);
  }

  /* ------------------------------------------------------------------------ */
  /*                                  BLOCKED                                 */
  /* ------------------------------------------------------------------------ */

  if (data.type === "BLOCKED") {
    if (!data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Date is required for a blocked date.",
      });
    }

    if (data.isAvailable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isAvailable"],
        message: "Blocked availability must have isAvailable as false.",
      });
    }

    if (data.dayOfWeek) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfWeek"],
        message: "Day of week is not used for a blocked date.",
      });
    }

    if (data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time is not used for a blocked date.",
      });
    }

    if (data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time is not used for a blocked date.",
      });
    }

    /*
     * Price is not required for BLOCKED.
     */
  }
};

/* -------------------------------------------------------------------------- */
/*                              Update Rules                                  */
/* -------------------------------------------------------------------------- */

const validateUpdateRules = (data, ctx) => {
  /*
   * PATCH mein fields optional hain.
   *
   * Existing values service layer mein merge hongi.
   * Isliye yahan sirf request mein aaye fields validate honge.
   */

  /* ------------------------------- BLOCKED ------------------------------- */

  if (data.type === "BLOCKED") {
    if (data.isAvailable === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isAvailable"],
        message: "Blocked availability must have isAvailable as false.",
      });
    }

    if (data.dayOfWeek) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfWeek"],
        message: "Day of week is not used for a blocked date.",
      });
    }

    if (data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time is not used for a blocked date.",
      });
    }

    if (data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time is not used for a blocked date.",
      });
    }
  }

  /* ---------------------------- PRICE CHECK ------------------------------ */

  if (data.price !== undefined && data.price < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "Price cannot be negative.",
    });
  }

  /* --------------------------- TIME RANGE -------------------------------- */

  if (data.startTime && data.endTime) {
    validateTimeRange(data, ctx);
  }
};

/* -------------------------------------------------------------------------- */
/*                         Create Availability Schema                          */
/* -------------------------------------------------------------------------- */

const createAvailabilitySchema = baseAvailabilitySchema
  .strict()
  .superRefine(validateCreateRules);

/* -------------------------------------------------------------------------- */
/*                         Update Availability Schema                          */
/* -------------------------------------------------------------------------- */

const updateAvailabilitySchema = baseAvailabilitySchema
  .partial()
  .strict()
  .superRefine(validateUpdateRules);

/* -------------------------------------------------------------------------- */
/*                       Availability ID Params Schema                         */
/* -------------------------------------------------------------------------- */

/**
 * Used for:
 *
 * PATCH /api/scheduling/availability/:id
 * DELETE /api/scheduling/availability/:id
 */

const availabilityIdParamsSchema = z
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

/* ------------------------ Create Availability ---------------------------- */

const validateCreateAvailability = parseRequestPart(
  createAvailabilitySchema,
  "body",
);

/* ------------------------ Update Availability ---------------------------- */

const validateUpdateAvailability = parseRequestPart(
  updateAvailabilitySchema,
  "body",
);

/* ----------------------- Availability ID Params -------------------------- */

const validateAvailabilityId = parseRequestPart(
  availabilityIdParamsSchema,
  "params",
);

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  validateCreateAvailability,
  validateUpdateAvailability,
  validateAvailabilityId,
};
