const therapistRepository = require("../repositories/therapist.repository");

const User = require("../../auth/models/user.model");

const ApiError = require("../../../utils/apiError");

// ===============================
// Check Therapist User
// ===============================

const checkTherapistUser = async (userId) => {
  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  if (user.role !== "THERAPIST") {
    throw new ApiError(
      403,
      "Only therapists can manage therapist profiles.",
      "THERAPIST_ONLY",
    );
  }

  return user;
};

// ===============================
// Create Therapist Profile
// ===============================

const createTherapistProfile = async (userId, data) => {
  await checkTherapistUser(userId);

  const existingProfile =
    await therapistRepository.findTherapistByUserId(userId);

  if (existingProfile) {
    throw new ApiError(
      409,
      "Therapist profile already exists.",
      "PROFILE_ALREADY_EXISTS",
    );
  }

  const therapist = await therapistRepository.createTherapist({
    userId,
    name: data.name,
    slug: data.slug,
    bio: data.bio,
    specializations: data.specializations,
    languages: data.languages,
    profileCompleted: true,
  });
  await User.findByIdAndUpdate(userId, {
    profileCompleted: true,
  });

  return therapist;
};

// ===============================
// Get My Therapist Profile
// ===============================

const getMyTherapistProfile = async (userId) => {
  await checkTherapistUser(userId);

  const therapist = await therapistRepository.findTherapistByUserId(userId);

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "PROFILE_NOT_FOUND",
    );
  }

  return therapist;
};

// ===============================
// Get All Therapists
// ===============================

const getAllTherapists = async () => {
  return await therapistRepository.findAllTherapists();
};

// ===============================
// Update My Therapist Profile
// ===============================

const updateMyTherapistProfile = async (userId, data) => {
  await checkTherapistUser(userId);

  const therapist = await therapistRepository.findTherapistByUserId(userId);

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "PROFILE_NOT_FOUND",
    );
  }

  const updatedTherapist = await therapistRepository.updateTherapistByUserId(
    userId,
    data,
  );

  return updatedTherapist;
};

// ===============================
// Delete My Therapist Profile
// ===============================

const deleteMyTherapistProfile = async (userId) => {
  await checkTherapistUser(userId);

  const therapist = await therapistRepository.findTherapistByUserId(userId);

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "PROFILE_NOT_FOUND",
    );
  }

  await therapistRepository.deleteTherapistByUserId(userId);
  await User.findByIdAndUpdate(userId, {
    profileCompleted: false,
  });
  return {
    id: therapist._id,
  };
};

module.exports = {
  createTherapistProfile,
  getMyTherapistProfile,
  getAllTherapists,
  updateMyTherapistProfile,
  deleteMyTherapistProfile,
};
