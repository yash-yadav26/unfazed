const availabilityRepository = require("../repositories/availability.repository");

const Therapist = require("../../therapist/models/therapist.model");

const User = require("../../auth/models/user.model");

const ApiError = require("../../../utils/apiError");

/* -------------------------------------------------------------------------- */
/*                         Get Logged-in Therapist                            */
/* -------------------------------------------------------------------------- */

const getTherapist = async (userId) => {
  const user = await User.findById(userId).select("_id role");

  if (!user) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  if (user.role !== "THERAPIST") {
    throw new ApiError(
      403,
      "Only therapists can manage availability.",
      "THERAPIST_ONLY",
    );
  }

  const therapist = await Therapist.findOne({
    userId,
  }).select("_id userId");

  if (!therapist) {
    throw new ApiError(
      404,
      "Therapist profile not found.",
      "THERAPIST_PROFILE_NOT_FOUND",
    );
  }

  return therapist;
};

/* -------------------------------------------------------------------------- */
/*                           Validate Time Range                              */
/* -------------------------------------------------------------------------- */

const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);

  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (end <= start) {
    throw new ApiError(
      400,
      "End time must be later than start time.",
      "INVALID_TIME_RANGE",
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                          Validate Future Date                              */
/* -------------------------------------------------------------------------- */

const validateFutureDate = (date) => {
  if (!date) {
    return;
  }

  const selectedDate = new Date(date);

  if (Number.isNaN(selectedDate.getTime())) {
    throw new ApiError(400, "Invalid date.", "INVALID_DATE");
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new ApiError(
      400,
      "Availability date cannot be in the past.",
      "PAST_DATE_NOT_ALLOWED",
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                         Validate Session Price                             */
/* -------------------------------------------------------------------------- */

const validatePrice = (price) => {
  if (price === undefined || price === null) {
    throw new ApiError(
      400,
      "Session price is required.",
      "SESSION_PRICE_REQUIRED",
    );
  }

  if (typeof price !== "number" || !Number.isFinite(price)) {
    throw new ApiError(
      400,
      "Session price must be a valid number.",
      "INVALID_SESSION_PRICE",
    );
  }

  if (price < 0) {
    throw new ApiError(
      400,
      "Session price cannot be negative.",
      "INVALID_SESSION_PRICE",
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                           Create Availability                              */
/* -------------------------------------------------------------------------- */

const createAvailability = async (userId, data) => {
  const therapist = await getTherapist(userId);

  /* ------------------------------------------------------------------------ */
  /*                                  WEEKLY                                  */
  /* ------------------------------------------------------------------------ */

  if (data.type === "WEEKLY") {
    const existing = await availabilityRepository.findWeeklyAvailability(
      therapist._id,
      data.dayOfWeek,
    );

    if (existing) {
      throw new ApiError(
        409,
        `Weekly availability for ${data.dayOfWeek} already exists.`,
        "WEEKLY_AVAILABILITY_ALREADY_EXISTS",
      );
    }

    if (data.isAvailable) {
      validateTimeRange(data.startTime, data.endTime);

      /*
       * Available weekly schedule must have a price.
       */
      validatePrice(data.price);
    } else {
      /*
       * Disabled weekly availability does not need
       * time or price.
       */
      data.price = null;
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                        One-time Override / Blocked                        */
  /* ------------------------------------------------------------------------ */

  if (data.type === "OVERRIDE" || data.type === "BLOCKED") {
    validateFutureDate(data.date);

    const existing = await availabilityRepository.findOneTimeAvailability(
      therapist._id,
      data.type,
      data.date,
    );

    if (existing) {
      throw new ApiError(
        409,
        data.type === "BLOCKED"
          ? "This date is already blocked."
          : "An override already exists for this date.",
        data.type === "BLOCKED"
          ? "DATE_ALREADY_BLOCKED"
          : "OVERRIDE_ALREADY_EXISTS",
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                 OVERRIDE                                 */
  /* ------------------------------------------------------------------------ */

  if (data.type === "OVERRIDE" && data.isAvailable) {
    validateTimeRange(data.startTime, data.endTime);

    /*
     * Available override must have its own price.
     */
    validatePrice(data.price);
  }

  /* ------------------------------------------------------------------------ */
  /*                                  BLOCKED                                 */
  /* ------------------------------------------------------------------------ */

  if (data.type === "BLOCKED") {
    data.isAvailable = false;

    delete data.startTime;
    delete data.endTime;

    /*
     * Price is not applicable for blocked dates.
     */
    data.price = null;
  }

  /* ------------------------------------------------------------------------ */
  /*                                Create                                    */
  /* ------------------------------------------------------------------------ */

  return await availabilityRepository.createAvailability({
    therapistId: therapist._id,
    ...data,
  });
};

/* -------------------------------------------------------------------------- */
/*                           Get My Availability                              */
/* -------------------------------------------------------------------------- */

const getMyAvailability = async (userId) => {
  const therapist = await getTherapist(userId);

  return await availabilityRepository.findAvailabilityByTherapistId(
    therapist._id,
  );
};

/* -------------------------------------------------------------------------- */
/*                         Update Availability                                */
/* -------------------------------------------------------------------------- */

const updateAvailability = async (userId, availabilityId, data) => {
  const therapist = await getTherapist(userId);

  const existing =
    await availabilityRepository.findAvailabilityById(availabilityId);

  if (!existing) {
    throw new ApiError(
      404,
      "Availability not found.",
      "AVAILABILITY_NOT_FOUND",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           Ownership Check                                */
  /* ------------------------------------------------------------------------ */

  if (existing.therapistId.toString() !== therapist._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to modify this availability.",
      "AVAILABILITY_ACCESS_DENIED",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                       Final Merged Values                                */
  /* ------------------------------------------------------------------------ */

  const finalType = data.type ?? existing.type;

  const finalDay = data.dayOfWeek ?? existing.dayOfWeek;

  const finalDate = data.date ?? existing.date;

  const finalAvailable = data.isAvailable ?? existing.isAvailable;

  const finalStartTime = data.startTime ?? existing.startTime;

  const finalEndTime = data.endTime ?? existing.endTime;

  const finalSessionDuration = data.sessionDuration ?? existing.sessionDuration;

  const finalBufferTime = data.bufferTime ?? existing.bufferTime;

  const finalPrice = data.price ?? existing.price;

  /* ------------------------------------------------------------------------ */
  /*                                  WEEKLY                                  */
  /* ------------------------------------------------------------------------ */

  if (finalType === "WEEKLY") {
    if (!finalDay) {
      throw new ApiError(
        400,
        "Day of week is required for weekly availability.",
        "DAY_OF_WEEK_REQUIRED",
      );
    }

    const duplicate = await availabilityRepository.findWeeklyAvailability(
      therapist._id,
      finalDay,
    );

    if (duplicate && duplicate._id.toString() !== existing._id.toString()) {
      throw new ApiError(
        409,
        `Weekly availability for ${finalDay} already exists.`,
        "WEEKLY_AVAILABILITY_ALREADY_EXISTS",
      );
    }

    if (finalAvailable) {
      validateTimeRange(finalStartTime, finalEndTime);

      /*
       * Available weekly schedule must have a price.
       */
      validatePrice(finalPrice);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                 OVERRIDE                                 */
  /* ------------------------------------------------------------------------ */

  if (finalType === "OVERRIDE") {
    if (!finalDate) {
      throw new ApiError(
        400,
        "Date is required for an override.",
        "DATE_REQUIRED",
      );
    }

    validateFutureDate(finalDate);

    const duplicate = await availabilityRepository.findOneTimeAvailability(
      therapist._id,
      "OVERRIDE",
      finalDate,
    );

    if (duplicate && duplicate._id.toString() !== existing._id.toString()) {
      throw new ApiError(
        409,
        "An override already exists for this date.",
        "OVERRIDE_ALREADY_EXISTS",
      );
    }

    if (finalAvailable) {
      validateTimeRange(finalStartTime, finalEndTime);

      /*
       * Available override must have a price.
       */
      validatePrice(finalPrice);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                  BLOCKED                                 */
  /* ------------------------------------------------------------------------ */

  if (finalType === "BLOCKED") {
    if (!finalDate) {
      throw new ApiError(
        400,
        "Date is required for a blocked date.",
        "DATE_REQUIRED",
      );
    }

    validateFutureDate(finalDate);

    const duplicate = await availabilityRepository.findOneTimeAvailability(
      therapist._id,
      "BLOCKED",
      finalDate,
    );

    if (duplicate && duplicate._id.toString() !== existing._id.toString()) {
      throw new ApiError(
        409,
        "This date is already blocked.",
        "DATE_ALREADY_BLOCKED",
      );
    }

    /*
     * BLOCKED availability does not use:
     * - startTime
     * - endTime
     * - price
     */
    data.isAvailable = false;
    data.price = null;

    delete data.startTime;
    delete data.endTime;
  }

  /* ------------------------------------------------------------------------ */
  /*                       Prepare Update Data                                */
  /* ------------------------------------------------------------------------ */

  const updateData = {
    ...data,
  };

  /*
   * Keep price synchronized with the final availability
   * configuration when price is not explicitly supplied.
   */
  if (finalType === "WEEKLY" || finalType === "OVERRIDE") {
    if (finalAvailable) {
      updateData.price = finalPrice;
    } else {
      updateData.price = null;
    }
  }

  if (finalType === "BLOCKED") {
    updateData.isAvailable = false;
    updateData.price = null;

    delete updateData.startTime;
    delete updateData.endTime;
  }

  /* ------------------------------------------------------------------------ */
  /*                              Update                                      */
  /* ------------------------------------------------------------------------ */

  return await availabilityRepository.updateAvailability(
    availabilityId,
    updateData,
  );
};

/* -------------------------------------------------------------------------- */
/*                         Delete Availability                                */
/* -------------------------------------------------------------------------- */

const deleteAvailability = async (userId, availabilityId) => {
  const therapist = await getTherapist(userId);

  const existing =
    await availabilityRepository.findAvailabilityById(availabilityId);

  if (!existing) {
    throw new ApiError(
      404,
      "Availability not found.",
      "AVAILABILITY_NOT_FOUND",
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           Ownership Check                                */
  /* ------------------------------------------------------------------------ */

  if (existing.therapistId.toString() !== therapist._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to delete this availability.",
      "AVAILABILITY_ACCESS_DENIED",
    );
  }

  await availabilityRepository.deleteAvailability(availabilityId);

  return {
    id: existing._id,
  };
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
};
