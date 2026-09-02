const therapistService = require("../services/therapist.service");

const ApiResponse = require("../../../utils/apiResponse");

const asyncHandler = require("../../../utils/asyncHandler");

/* -------------------------------------------------------------------------- */
/*                         Create Therapist Profile                           */
/* -------------------------------------------------------------------------- */

const createTherapistController = asyncHandler(async (req, res) => {
  const result = await therapistService.createTherapistProfile(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, result, "Therapist profile created successfully."),
    );
});

/* -------------------------------------------------------------------------- */
/*                         Get My Therapist Profile                           */
/* -------------------------------------------------------------------------- */

const getMyTherapistController = asyncHandler(async (req, res) => {
  const result = await therapistService.getMyTherapistProfile(req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Therapist profile fetched successfully."),
    );
});

/* -------------------------------------------------------------------------- */
/*                           Get All Therapists                               */
/* -------------------------------------------------------------------------- */

const getAllTherapistsController = asyncHandler(async (req, res) => {
  const result = await therapistService.getAllTherapists();

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Therapists fetched successfully."));
});

/* -------------------------------------------------------------------------- */
/*                       Get Therapist Profile By Slug                        */
/* -------------------------------------------------------------------------- */

/**
 * Public therapist profile.
 *
 * GET /api/therapists/:slug
 */
const getTherapistBySlugController = asyncHandler(async (req, res) => {
  const { slug } = req.validatedParams;

  const result = await therapistService.getTherapistBySlug(slug);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Therapist profile fetched successfully."),
    );
});

/* -------------------------------------------------------------------------- */
/*                       Update My Therapist Profile                          */
/* -------------------------------------------------------------------------- */

const updateMyTherapistController = asyncHandler(async (req, res) => {
  const result = await therapistService.updateMyTherapistProfile(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Therapist profile updated successfully."),
    );
});

/* -------------------------------------------------------------------------- */
/*                       Delete My Therapist Profile                          */
/* -------------------------------------------------------------------------- */

const deleteMyTherapistController = asyncHandler(async (req, res) => {
  const result = await therapistService.deleteMyTherapistProfile(req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Therapist profile deleted successfully."),
    );
});

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  createTherapistController,
  getMyTherapistController,
  getAllTherapistsController,
  getTherapistBySlugController,
  updateMyTherapistController,
  deleteMyTherapistController,
};
