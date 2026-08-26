const Joi = require("joi");

const Therapist = require("../models/Therapist");
const Client = require("../models/Client");

const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const { generateToken } = require("../utils/jwt");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().email().trim().lowercase().required(),

  password: Joi.string().min(6).required(),

  role: Joi.string()
    .valid("CLIENT", "THERAPIST")
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),

  password: Joi.string().required(),

  role: Joi.string()
    .valid("CLIENT", "THERAPIST")
    .required(),
});

const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);

  if (error) {
    throw new ApiError(
      400,
      error.details[0].message,
      "VALIDATION_ERROR"
    );
  }

  const {
    name,
    email,
    password,
    role,
  } = value;

  const Model =
    role === "THERAPIST"
      ? Therapist
      : Client;

  const existingUser = await Model.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists.",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await Model.create({
    name,
    email,
    passwordHash,
    role,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileCompleted: user.profileCompleted,
        },
        "Account created successfully."
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    throw new ApiError(
      400,
      error.details[0].message,
      "VALIDATION_ERROR"
    );
  }

  const {
    email,
    password,
    role,
  } = value;

  const Model =
    role === "THERAPIST"
      ? Therapist
      : Client;

  const user = await Model.findOne({ email })
    .select("+passwordHash");

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  const isPasswordValid =
    await comparePassword(
      password,
      user.passwordHash
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  const token = generateToken(user);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          token,

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted:
              user.profileCompleted,
          },
        },
        "Login successful."
      )
    );
});

module.exports = {
  register,
  login,
};