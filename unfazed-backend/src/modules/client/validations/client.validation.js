const { z } = require("zod");

const ApiError = require("../../../utils/apiError");

// ===============================
// Client Profile Schema
// ===============================

const clientProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters."),

    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number."),

    age: z.coerce
      .number()
      .int("Age must be a whole number.")
      .min(1, "Age must be at least 1.")
      .max(120, "Age cannot exceed 120."),

    gender: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(
        z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
          message: "Gender must be Male, Female, Other, or Prefer not to say.",
        }),
      ),

    occupation: z
      .string()
      .trim()
      .min(2, "Occupation must be at least 2 characters.")
      .max(100, "Occupation cannot exceed 100 characters."),

    presentingConcern: z
      .string()
      .trim()
      .min(10, "Presenting concern must be at least 10 characters.")
      .max(2000, "Presenting concern cannot exceed 2000 characters."),

    relevantHistory: z
      .string()
      .trim()
      .min(10, "Relevant history must be at least 10 characters.")
      .max(4000, "Relevant history cannot exceed 4000 characters."),

    consent: z.literal(true, {
      message: "Consent is required to complete your profile.",
    }),
  })
  .strict();

// ===============================
// Create Profile Schema
// ===============================

const createClientSchema = clientProfileSchema;

// ===============================
// Update Profile Schema
// ===============================

const updateClientSchema = clientProfileSchema.partial();

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

const validateCreateClient = parseRequestPart(createClientSchema, "body");

const validateUpdateClient = parseRequestPart(updateClientSchema, "body");

module.exports = {
  validateCreateClient,
  validateUpdateClient,
};
