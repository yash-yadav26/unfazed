const crypto = require("crypto");
const Razorpay = require("razorpay");

const paymentRepository = require("../repositories/payment.repository");

const Availability = require("../../scheduling/models/availability.model");
const Therapist = require("../../therapist/models/therapist.model");
const Client = require("../../client/models/client.model");
const Session = require("../../session/models/session.model");

const ApiError = require("../../../utils/apiError.js");

const ACTIVE_SESSION_STATUSES = ["PENDING", "CONFIRMED"];

/* =========================================================
   RAZORPAY INSTANCE
========================================================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDate = (date) => {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid session date.");
  }

  return parsedDate;
};

const validateFutureDate = (date) => {
  const today = new Date();

  today.setUTCHours(0, 0, 0, 0);

  if (date < today) {
    throw new ApiError(400, "Session date must be today or a future date.");
  }
};

/* =========================================================
   DAY OF WEEK
========================================================= */

const getDayOfWeek = (date) => {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return days[date.getUTCDay()];
};

/* =========================================================
   TIME HELPERS
========================================================= */

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/* =========================================================
   FIND THERAPIST
========================================================= */

const getTherapist = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId).lean();

  if (!therapist) {
    throw new ApiError(404, "Therapist not found.");
  }

  return therapist;
};

/* =========================================================
   FIND CLIENT
========================================================= */

const getClient = async (userId) => {
  const client = await Client.findOne({
    userId,
  }).lean();

  if (!client) {
    throw new ApiError(404, "Client profile not found.");
  }

  return client;
};

/* =========================================================
   GET EFFECTIVE AVAILABILITY
========================================================= */

const getEffectiveAvailability = async (therapistId, date) => {
  const dayOfWeek = getDayOfWeek(date);

  /*
   * One-time availability has priority over weekly
   * availability.
   */

  const oneTimeAvailability = await Availability.findOne({
    therapistId,
    type: {
      $in: ["OVERRIDE", "BLOCKED"],
    },
    date,
  }).lean();

  if (oneTimeAvailability) {
    return {
      availability: oneTimeAvailability,
      dayOfWeek,
    };
  }

  const weeklyAvailability = await Availability.findOne({
    therapistId,
    type: "WEEKLY",
    dayOfWeek,
    isAvailable: true,
  }).lean();

  return {
    availability: weeklyAvailability,
    dayOfWeek,
  };
};

/* =========================================================
   GENERATE SLOT LIST
========================================================= */

const generateSlots = (startTime, endTime, sessionDuration, bufferTime) => {
  const startMinutes = timeToMinutes(startTime);

  const endMinutes = timeToMinutes(endTime);

  const slots = [];

  let currentMinutes = startMinutes;

  while (currentMinutes + sessionDuration <= endMinutes) {
    slots.push(minutesToTime(currentMinutes));

    currentMinutes += sessionDuration + bufferTime;
  }

  return slots;
};

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

const createPaymentOrder = async (userId, data) => {
  const { therapistId, date: dateString, startTime } = data;

  /* ---------------------------------------------------------
     CLIENT
  --------------------------------------------------------- */

  const client = await getClient(userId);

  /* ---------------------------------------------------------
     THERAPIST
  --------------------------------------------------------- */

  await getTherapist(therapistId);

  /* ---------------------------------------------------------
     DATE
  --------------------------------------------------------- */

  const date = parseDate(dateString);

  validateFutureDate(date);

  /* ---------------------------------------------------------
     GET AVAILABILITY
  --------------------------------------------------------- */

  const { availability, dayOfWeek } = await getEffectiveAvailability(
    therapistId,
    date,
  );

  if (!availability) {
    throw new ApiError(400, `Therapist is not available on ${dayOfWeek}.`);
  }

  /* ---------------------------------------------------------
     BLOCKED / UNAVAILABLE
  --------------------------------------------------------- */

  if (availability.type === "BLOCKED" || availability.isAvailable === false) {
    throw new ApiError(400, "Therapist is not available on the selected date.");
  }

  /* ---------------------------------------------------------
     REQUIRED AVAILABILITY DATA
  --------------------------------------------------------- */

  if (!availability.startTime || !availability.endTime) {
    throw new ApiError(400, "Therapist availability time is not configured.");
  }

  if (
    availability.sessionDuration === null ||
    availability.sessionDuration === undefined
  ) {
    throw new ApiError(400, "Session duration is not configured.");
  }

  if (availability.price === null || availability.price === undefined) {
    throw new ApiError(400, "Session price is not configured.");
  }

  /* ---------------------------------------------------------
     GENERATE VALID SLOTS
  --------------------------------------------------------- */

  const slots = generateSlots(
    availability.startTime,
    availability.endTime,
    availability.sessionDuration,
    availability.bufferTime || 0,
  );

  if (!slots.includes(startTime)) {
    throw new ApiError(400, "Selected session slot is not available.");
  }

  /* ---------------------------------------------------------
     CHECK EXISTING BOOKING
  --------------------------------------------------------- */

  const existingSession = await Session.findOne({
    therapistId,
    date,
    startTime,
    status: {
      $in: ACTIVE_SESSION_STATUSES,
    },
  }).lean();

  if (existingSession) {
    throw new ApiError(409, "Selected session slot has already been booked.");
  }

  /* ---------------------------------------------------------
     CHECK EXISTING PAYMENT FOR SAME SLOT
  --------------------------------------------------------- */

  const existingPayment = await paymentRepository.findPaymentsByClientId(
    client._id,
  );

  const pendingPayment = existingPayment.find(
    (payment) =>
      payment.therapistId?.toString() === therapistId.toString() &&
      payment.status === "CREATED" &&
      payment.sessionId === null,
  );

  /*
   * We do not reuse old pending payment orders here.
   * A fresh Razorpay order is safer for this flow.
   */

  void pendingPayment;

  /* ---------------------------------------------------------
     ACTUAL PRICE
  --------------------------------------------------------- */

  const amount = Number(availability.price);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, "Invalid session price.");
  }

  /*
   * Razorpay expects amount in the smallest currency
   * unit. For INR:
   *
   * ₹700 -> 70000 paise
   */

  const amountInPaise = Math.round(amount * 100);

  /* ---------------------------------------------------------
     CREATE RAZORPAY ORDER
  --------------------------------------------------------- */

  const receipt = `session_${client._id}_${Date.now()}`;

  let razorpayOrder;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        clientId: client._id.toString(),
        therapistId: therapistId.toString(),
        date: dateString,
        startTime,
        sessionDuration: availability.sessionDuration.toString(),
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    throw new ApiError(502, "Failed to create Razorpay order.");
  }

  /* ---------------------------------------------------------
     SAVE PAYMENT RECORD
  --------------------------------------------------------- */

  const payment = await paymentRepository.createPayment({
    clientId: client._id,

    therapistId,

    sessionId: null,

    razorpayOrderId: razorpayOrder.id,

    amount,

    currency: "INR",

    status: "CREATED",
  });

  /* ---------------------------------------------------------
     RESPONSE
  --------------------------------------------------------- */

  return {
    paymentId: payment._id,

    razorpayOrderId: razorpayOrder.id,

    amount,

    amountInPaise,

    currency: "INR",

    keyId: process.env.RAZORPAY_KEY_ID,

    sessionDuration: availability.sessionDuration,

    bufferTime: availability.bufferTime,

    date: dateString,

    startTime,

    therapistId,
  };
};

/* =========================================================
   VERIFY PAYMENT SIGNATURE
========================================================= */

const verifyPayment = async (userId, data) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

  /* ---------------------------------------------------------
     CLIENT
  --------------------------------------------------------- */

  const client = await getClient(userId);

  /* ---------------------------------------------------------
     FIND PAYMENT
  --------------------------------------------------------- */

  const payment = await paymentRepository.findPaymentByOrderId(razorpayOrderId);

  if (!payment) {
    throw new ApiError(404, "Payment record not found.");
  }

  /* ---------------------------------------------------------
     OWNERSHIP CHECK
  --------------------------------------------------------- */

  if (payment.clientId.toString() !== client._id.toString()) {
    throw new ApiError(403, "You are not allowed to verify this payment.");
  }

  /* ---------------------------------------------------------
     ALREADY PAID
  --------------------------------------------------------- */

  if (payment.status === "PAID") {
    return {
      payment,
      alreadyVerified: true,
    };
  }

  /* ---------------------------------------------------------
     GENERATE SIGNATURE
  --------------------------------------------------------- */

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(razorpaySignature),
  );

  if (!signaturesMatch) {
    await paymentRepository.updatePaymentByOrderId(razorpayOrderId, {
      razorpayPaymentId,
      status: "FAILED",
      failedAt: new Date(),
    });

    throw new ApiError(400, "Payment signature verification failed.");
  }

  /* ---------------------------------------------------------
     VERIFY PAYMENT WITH RAZORPAY
  --------------------------------------------------------- */

  let razorpayPayment;

  try {
    razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
  } catch (error) {
    console.error("Failed to fetch Razorpay payment:", error);

    throw new ApiError(502, "Unable to verify Razorpay payment status.");
  }

  if (razorpayPayment.order_id !== razorpayOrderId) {
    throw new ApiError(400, "Payment does not belong to this order.");
  }

  /*
   * For an automatically captured payment, status
   * should be "captured".
   *
   * We do not mark the payment as PAID otherwise.
   */

  if (razorpayPayment.status !== "captured") {
    throw new ApiError(
      400,
      `Payment is not captured. Current status: ${razorpayPayment.status}`,
    );
  }

  /* ---------------------------------------------------------
     AMOUNT CHECK
  --------------------------------------------------------- */

  const expectedAmountInPaise = Math.round(payment.amount * 100);

  if (Number(razorpayPayment.amount) !== expectedAmountInPaise) {
    throw new ApiError(400, "Payment amount does not match the order amount.");
  }

  /* ---------------------------------------------------------
     UPDATE PAYMENT
  --------------------------------------------------------- */

  const updatedPayment = await paymentRepository.updatePaymentByOrderId(
    razorpayOrderId,
    {
      razorpayPaymentId,
      razorpaySignature,
      status: "PAID",
      paidAt: new Date(),
    },
  );

  /* ---------------------------------------------------------
     RETURN PAYMENT
  --------------------------------------------------------- */

  return {
    payment: updatedPayment,
    alreadyVerified: false,
  };
};

/* =========================================================
   COMPLETE PAYMENT + CREATE SESSION
========================================================= */

const completePaymentAndCreateSession = async (userId, data) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

  /* ---------------------------------------------------------
     VERIFY PAYMENT
  --------------------------------------------------------- */

  const verification = await verifyPayment(userId, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  let payment = verification.payment;

  /* ---------------------------------------------------------
     IF SESSION ALREADY EXISTS
  --------------------------------------------------------- */

  if (payment.sessionId) {
    const session = await Session.findById(payment.sessionId).lean();

    return {
      payment,
      session,
      alreadyCompleted: true,
    };
  }

  /* ---------------------------------------------------------
     GET CLIENT
  --------------------------------------------------------- */

  const client = await getClient(userId);

  /* ---------------------------------------------------------
     PAYMENT NOTES / ORIGINAL BOOKING DATA
  --------------------------------------------------------- */

  const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);

  const notes = razorpayOrder.notes || {};

  const therapistId = notes.therapistId;

  const dateString = notes.date;

  const startTime = notes.startTime;

  const sessionDuration = Number(notes.sessionDuration);

  if (!therapistId || !dateString || !startTime || !sessionDuration) {
    throw new ApiError(
      400,
      "Booking information is missing from the payment order.",
    );
  }

  /* ---------------------------------------------------------
     DATE
  --------------------------------------------------------- */

  const date = parseDate(dateString);

  validateFutureDate(date);

  /* ---------------------------------------------------------
     RECHECK AVAILABILITY
  --------------------------------------------------------- */

  const { availability } = await getEffectiveAvailability(therapistId, date);

  if (
    !availability ||
    availability.type === "BLOCKED" ||
    availability.isAvailable === false
  ) {
    throw new ApiError(
      409,
      "Therapist is no longer available for this session.",
    );
  }

  const validSlots = generateSlots(
    availability.startTime,
    availability.endTime,
    availability.sessionDuration,
    availability.bufferTime || 0,
  );

  if (!validSlots.includes(startTime)) {
    throw new ApiError(
      409,
      "The selected session slot is no longer available.",
    );
  }

  /* ---------------------------------------------------------
     RECHECK SLOT
  --------------------------------------------------------- */

  const existingSession = await Session.findOne({
    therapistId,
    date,
    startTime,
    status: {
      $in: ACTIVE_SESSION_STATUSES,
    },
  }).lean();

  if (existingSession) {
    throw new ApiError(409, "This session slot has already been booked.");
  }

  /* ---------------------------------------------------------
     CALCULATE END TIME
  --------------------------------------------------------- */

  const endTime = minutesToTime(
    timeToMinutes(startTime) + availability.sessionDuration,
  );

  /* ---------------------------------------------------------
     CREATE SESSION
  --------------------------------------------------------- */

  let session;

  try {
    session = await Session.create({
      clientId: client._id,

      therapistId,

      date,

      startTime,

      endTime,

      duration: availability.sessionDuration,

      status: "CONFIRMED",

      paymentStatus: "PAID",

      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    /*
     * Unique index protects against two simultaneous
     * bookings for the same therapist/date/startTime.
     */

    if (error?.code === 11000) {
      throw new ApiError(409, "This session slot has already been booked.");
    }

    throw error;
  }

  /* ---------------------------------------------------------
     LINK PAYMENT TO SESSION
  --------------------------------------------------------- */

  payment = await paymentRepository.updatePaymentByOrderId(razorpayOrderId, {
    sessionId: session._id,
  });

  /* ---------------------------------------------------------
     RESPONSE
  --------------------------------------------------------- */

  return {
    payment,
    session,
    alreadyCompleted: false,
  };
};

/* =========================================================
   GET MY PAYMENTS
========================================================= */

const getMyPayments = async (userId) => {
  const client = await getClient(userId);

  const payments = await paymentRepository.findPaymentsByClientId(client._id);

  return payments;
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createPaymentOrder,
  verifyPayment,
  completePaymentAndCreateSession,
  getMyPayments,
};
