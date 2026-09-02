const clientRepository = require("../repositories/client.repository");

const User = require("../../auth/models/user.model");
const Therapist = require("../../therapist/models/therapist.model");

const ApiError = require("../../../utils/apiError");

/* =========================================================
   Check Client User
========================================================= */

const checkClientUser = async (userId) => {
  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  if (user.role !== "CLIENT") {
    throw new ApiError(
      403,
      "Only clients can manage client profiles.",
      "CLIENT_ONLY",
    );
  }

  return user;
};

/* =========================================================
   Check Therapist User
========================================================= */

const checkTherapistUser = async (userId) => {
  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  if (user.role !== "THERAPIST") {
    throw new ApiError(
      403,
      "Only therapists can access their clients.",
      "THERAPIST_ONLY",
    );
  }

  return user;
};

/* =========================================================
   Create Client Profile
========================================================= */

const createClientProfile = async (userId, data) => {
  await checkClientUser(userId);

  const existingProfile = await clientRepository.findClientByUserId(userId);

  if (existingProfile) {
    throw new ApiError(
      409,
      "Client profile already exists.",
      "PROFILE_ALREADY_EXISTS",
    );
  }

  const client = await clientRepository.createClient({
    userId,
    name: data.name,
    phone: data.phone,
    age: data.age,
    gender: data.gender,
    occupation: data.occupation,
    presentingConcern: data.presentingConcern,
    relevantHistory: data.relevantHistory,
    consent: data.consent,
    profileCompleted: true,
  });

  await User.findByIdAndUpdate(userId, {
    profileCompleted: true,
  });

  return client;
};

/* =========================================================
   Get My Client Profile
========================================================= */

const getMyClientProfile = async (userId) => {
  await checkClientUser(userId);

  const client = await clientRepository.findClientByUserId(userId);

  if (!client) {
    throw new ApiError(404, "Client profile not found.", "PROFILE_NOT_FOUND");
  }

  return client;
};

/* =========================================================
   Update My Client Profile
========================================================= */

const updateMyClientProfile = async (userId, data) => {
  await checkClientUser(userId);

  const client = await clientRepository.findClientByUserId(userId);

  if (!client) {
    throw new ApiError(404, "Client profile not found.", "PROFILE_NOT_FOUND");
  }

  const updatedClient = await clientRepository.updateClientByUserId(
    userId,
    data,
  );

  return updatedClient;
};

/* =========================================================
   Delete My Client Profile
========================================================= */

const deleteMyClientProfile = async (userId) => {
  await checkClientUser(userId);

  const client = await clientRepository.findClientByUserId(userId);

  if (!client) {
    throw new ApiError(404, "Client profile not found.", "PROFILE_NOT_FOUND");
  }

  await clientRepository.deleteClientByUserId(userId);

  await User.findByIdAndUpdate(userId, {
    profileCompleted: false,
  });

  return {
    id: client._id,
  };
};

/* =========================================================
   Get My Clients
========================================================= */

/**
 * Therapist ke woh clients fetch karta hai
 * jinke saath therapist ki at least one session hai.
 *
 * Relationship Session collection se derive hota hai.
 */

const getMyClients = async (userId) => {
  await checkTherapistUser(userId);

  // User ID se therapist profile find karo.
  const therapist = await Therapist.findOne({
    userId,
  }).select("_id");

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "THERAPIST_PROFILE_NOT_FOUND",
    );
  }

  // Therapist document ka _id repository ko bhejna hai.
  const clients = await clientRepository.findClientsByTherapistId(
    therapist._id,
  );

  return clients;
};

/* =========================================================
   Exports
========================================================= */

module.exports = {
  createClientProfile,
  getMyClientProfile,
  updateMyClientProfile,
  deleteMyClientProfile,
  getMyClients,
};
