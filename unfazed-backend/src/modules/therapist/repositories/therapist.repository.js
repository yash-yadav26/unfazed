const Therapist = require("../models/therapist.model");

// Find therapist profile by user ID
const findTherapistByUserId = async (userId) => {
  return await Therapist.findOne({ userId }).lean();
};

// Get all therapist profiles
const findAllTherapists = async () => {
  return await Therapist.find().lean();
};

// Create therapist profile
const createTherapist = async (therapistData) => {
  return await Therapist.create(therapistData);
};

// Update therapist profile by user ID
const updateTherapistByUserId = async (userId, data) => {
  return await Therapist.findOneAndUpdate({ userId }, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

// Delete therapist profile by user ID
const deleteTherapistByUserId = async (userId) => {
  return await Therapist.findOneAndDelete({ userId });
};

module.exports = {
  findTherapistByUserId,
  findAllTherapists,
  createTherapist,
  updateTherapistByUserId,
  deleteTherapistByUserId,
};
