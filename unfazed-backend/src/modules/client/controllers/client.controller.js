const clientService = require("../services/client.service");

const ApiResponse = require("../../../utils/apiResponse");

const asyncHandler = require("../../../utils/asyncHandler");

/* =========================================================
   Create Client Profile
========================================================= */

const createClientController = asyncHandler(async (req, res) => {
  const result = await clientService.createClientProfile(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Client profile created successfully."));
});

/* =========================================================
   Get My Client Profile
========================================================= */

const getMyClientController = asyncHandler(async (req, res) => {
  const result = await clientService.getMyClientProfile(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Client profile fetched successfully."));
});

/* =========================================================
   Update My Client Profile
========================================================= */

const updateMyClientController = asyncHandler(async (req, res) => {
  const result = await clientService.updateMyClientProfile(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Client profile updated successfully."));
});

/* =========================================================
   Delete My Client Profile
========================================================= */

const deleteMyClientController = asyncHandler(async (req, res) => {
  const result = await clientService.deleteMyClientProfile(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Client profile deleted successfully."));
});

/* =========================================================
   Get My Clients
========================================================= */

/*
 * Therapist ke booked clients fetch honge.
 *
 * Relationship Session collection se derive hota hai.
 */

const getMyClientsController = asyncHandler(async (req, res) => {
  const result = await clientService.getMyClients(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Clients fetched successfully."));
});

/* =========================================================
   Exports
========================================================= */

module.exports = {
  createClientController,
  getMyClientController,
  updateMyClientController,
  deleteMyClientController,
  getMyClientsController,
};
