const mongoose = require("mongoose");
const { z } = require("zod");

/* =========================================================
   ObjectId Schema
========================================================= */

const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId.",
  });

/* =========================================================
   Create Note Schema
========================================================= */

const createNoteSchema = z
  .object({
    sessionId: objectIdSchema,

    type: z.enum(["PRIVATE", "SHARED"], {
      errorMap: () => ({
        message: "Note type must be PRIVATE or SHARED.",
      }),
    }),

    content: z
      .string()
      .trim()
      .min(1, "Note content is required.")
      .max(10000, "Note content cannot exceed 10000 characters."),
  })
  .strict();

/* =========================================================
   Update Note Schema
========================================================= */

const updateNoteSchema = z
  .object({
    type: z
      .enum(["PRIVATE", "SHARED"], {
        errorMap: () => ({
          message: "Note type must be PRIVATE or SHARED.",
        }),
      })
      .optional(),

    content: z
      .string()
      .trim()
      .min(1, "Note content is required.")
      .max(10000, "Note content cannot exceed 10000 characters.")
      .optional(),
  })
  .strict()
  .refine((data) => data.type !== undefined || data.content !== undefined, {
    message: "At least one field is required to update the note.",
  });

/* =========================================================
   Session ID Params Schema
========================================================= */

const sessionIdParamsSchema = z
  .object({
    sessionId: objectIdSchema,
  })
  .strict();

/* =========================================================
   Note ID Params Schema
========================================================= */

const noteIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

/* =========================================================
   Create Note Validation Middleware
========================================================= */

const validateCreateNote = (req, res, next) => {
  const result = createNoteSchema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.validatedBody = result.data;

  next();
};

/* =========================================================
   Update Note Validation Middleware
========================================================= */

const validateUpdateNote = (req, res, next) => {
  const result = updateNoteSchema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.validatedBody = result.data;

  next();
};

/* =========================================================
   Session ID Validation Middleware
========================================================= */

const validateSessionId = (req, res, next) => {
  const result = sessionIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    return next(result.error);
  }

  req.validatedParams = result.data;

  next();
};

/* =========================================================
   Note ID Validation Middleware
========================================================= */

const validateNoteId = (req, res, next) => {
  const result = noteIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    return next(result.error);
  }

  req.validatedParams = result.data;

  next();
};

/* =========================================================
   Exports
========================================================= */

module.exports = {
  validateCreateNote,
  validateUpdateNote,
  validateSessionId,
  validateNoteId,
};
