const Availability = require("../models/availability.model");

/* -------------------------------------------------------------------------- */
/*                         Create Availability                                */
/* -------------------------------------------------------------------------- */

const createAvailability = async (availabilityData) => {
  return await Availability.create(availabilityData);
};

/* -------------------------------------------------------------------------- */
/*                  Find All Availability by Therapist                        */
/* -------------------------------------------------------------------------- */

const findAvailabilityByTherapistId = async (therapistId) => {
  return await Availability.find({
    therapistId,
  })
    .sort({
      type: 1,
      dayOfWeek: 1,
      date: 1,
    })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                         Find Availability by ID                            */
/* -------------------------------------------------------------------------- */

const findAvailabilityById = async (availabilityId) => {
  return await Availability.findById(availabilityId).lean();
};

/* -------------------------------------------------------------------------- */
/*                        Find Weekly Availability                            */
/* -------------------------------------------------------------------------- */

const findWeeklyAvailability = async (therapistId, dayOfWeek) => {
  return await Availability.findOne({
    therapistId,
    type: "WEEKLY",
    dayOfWeek,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                     Find One-Time Availability                             */
/* -------------------------------------------------------------------------- */

const findOneTimeAvailability = async (therapistId, type, date) => {
  return await Availability.findOne({
    therapistId,
    type,
    date,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                          Update Availability                               */
/* -------------------------------------------------------------------------- */

const updateAvailability = async (availabilityId, data) => {
  return await Availability.findByIdAndUpdate(availabilityId, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                          Delete Availability                               */
/* -------------------------------------------------------------------------- */

const deleteAvailability = async (availabilityId) => {
  return await Availability.findByIdAndDelete(availabilityId).lean();
};

/* -------------------------------------------------------------------------- */
/*                    Delete Weekly Availability by Day                       */
/* -------------------------------------------------------------------------- */

const deleteWeeklyAvailability = async (therapistId, dayOfWeek) => {
  return await Availability.findOneAndDelete({
    therapistId,
    type: "WEEKLY",
    dayOfWeek,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                  Find Availability for Specific Date                       */
/* -------------------------------------------------------------------------- */

const findAvailabilityForDate = async (therapistId, date) => {
  return await Availability.findOne({
    therapistId,
    type: {
      $in: ["OVERRIDE", "BLOCKED"],
    },
    date,
  }).lean();
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  createAvailability,
  findAvailabilityByTherapistId,
  findAvailabilityById,
  findWeeklyAvailability,
  findOneTimeAvailability,
  updateAvailability,
  deleteAvailability,
  deleteWeeklyAvailability,
  findAvailabilityForDate,
};
