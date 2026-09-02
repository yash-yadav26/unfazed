const Therapist = require("../models/therapist.model");

/* -------------------------------------------------------------------------- */
/*                    Find Therapist Profile by User ID                       */
/* -------------------------------------------------------------------------- */

const findTherapistByUserId = async (userId) => {
  return await Therapist.findOne({
    userId,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                     Find Therapist Profile by Slug                         */
/* -------------------------------------------------------------------------- */

/**
 * Used for:
 * GET /api/therapists/:slug
 */
const findTherapistBySlug = async (slug) => {
  return await Therapist.findOne({
    slug,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                           Get All Therapists                               */
/* -------------------------------------------------------------------------- */

const findAllTherapists = async () => {
  return await Therapist.find().lean();
};

/* -------------------------------------------------------------------------- */
/*                         Create Therapist Profile                            */
/* -------------------------------------------------------------------------- */

const createTherapist = async (therapistData) => {
  return await Therapist.create(therapistData);
};

/* -------------------------------------------------------------------------- */
/*                    Update Therapist Profile by User ID                     */
/* -------------------------------------------------------------------------- */

const updateTherapistByUserId = async (userId, data) => {
  return await Therapist.findOneAndUpdate(
    {
      userId,
    },
    data,
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();
};

/* -------------------------------------------------------------------------- */
/*                    Delete Therapist Profile by User ID                     */
/* -------------------------------------------------------------------------- */

const deleteTherapistByUserId = async (userId) => {
  return await Therapist.findOneAndDelete({
    userId,
  });
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  findTherapistByUserId,
  findTherapistBySlug,
  findAllTherapists,
  createTherapist,
  updateTherapistByUserId,
  deleteTherapistByUserId,
};
