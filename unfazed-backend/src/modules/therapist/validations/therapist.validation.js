const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

// ===============================
// Therapist Profile Schema
// ===============================

const therapistProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters."),

    slug: z
      .string()
      .trim()
      .min(2, "Profile slug must be at least 2 characters.")
      .max(100, "Profile slug cannot exceed 100 characters.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Profile slug can only contain lowercase letters, numbers, and hyphens.",
      ),

    bio: z
      .string()
      .trim()
      .min(20, "Bio must be at least 20 characters.")
      .max(500, "Bio cannot exceed 500 characters."),

    specializations: z
      .array(z.string().trim().min(1, "Specialization cannot be empty."))
      .min(1, "At least one specialization is required."),

    languages: z
      .array(z.string().trim().min(1, "Language cannot be empty."))
      .min(1, "At least one language is required."),
  })
  .strict();

// ===============================
// Create Profile Schema
// ===============================

const createTherapistSchema = therapistProfileSchema;

// ===============================
// Update Profile Schema
// ===============================

const updateTherapistSchema = therapistProfileSchema.partial();

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
// Export Validators
// ===============================

const validateCreateTherapist = parseRequestPart(createTherapistSchema, "body");

const validateUpdateTherapist = parseRequestPart(updateTherapistSchema, "body");

module.exports = {
  validateCreateTherapist,
  validateUpdateTherapist,
};
