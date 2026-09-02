const availabilityService = require("../services/availability.service");

const ApiResponse = require("../../../utils/apiResponse");
const asyncHandler = require("../../../utils/asyncHandler");

/* -------------------------------------------------------------------------- */
/*                         Create Availability                                */
/* -------------------------------------------------------------------------- */

const createAvailabilityController = asyncHandler(async (req, res) => {
  const result = await availabilityService.createAvailability(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Availability created successfully."));
});

/* -------------------------------------------------------------------------- */
/*                          Get My Availability                               */
/* -------------------------------------------------------------------------- */

const getMyAvailabilityController = asyncHandler(async (req, res) => {
  const result = await availabilityService.getMyAvailability(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Availability fetched successfully."));
});

/* -------------------------------------------------------------------------- */
/*                          Update Availability                               */
/* -------------------------------------------------------------------------- */

const updateAvailabilityController = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;

  const result = await availabilityService.updateAvailability(
    req.user.id,
    id,
    req.validatedBody,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Availability updated successfully."));
});

/* -------------------------------------------------------------------------- */
/*                          Delete Availability                               */
/* -------------------------------------------------------------------------- */

const deleteAvailabilityController = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;

  const result = await availabilityService.deleteAvailability(req.user.id, id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Availability deleted successfully."));
});

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  createAvailabilityController,
  getMyAvailabilityController,
  updateAvailabilityController,
  deleteAvailabilityController,
};
