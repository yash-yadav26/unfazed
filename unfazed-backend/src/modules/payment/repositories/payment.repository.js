const Payment = require("../models/payment.model");

/* =========================================================
   CREATE PAYMENT
========================================================= */

const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

/* =========================================================
   FIND PAYMENT BY ID
========================================================= */

const findPaymentById = async (paymentId) => {
  return await Payment.findById(paymentId).lean();
};

/* =========================================================
   FIND PAYMENT BY RAZORPAY ORDER ID
========================================================= */

const findPaymentByOrderId = async (razorpayOrderId) => {
  return await Payment.findOne({
    razorpayOrderId,
  }).lean();
};

/* =========================================================
   FIND PAYMENT BY RAZORPAY PAYMENT ID
========================================================= */

const findPaymentByRazorpayPaymentId = async (razorpayPaymentId) => {
  return await Payment.findOne({
    razorpayPaymentId,
  }).lean();
};

/* =========================================================
   UPDATE PAYMENT
========================================================= */

const updatePayment = async (paymentId, data) => {
  return await Payment.findByIdAndUpdate(paymentId, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* =========================================================
   UPDATE PAYMENT BY ORDER ID
========================================================= */

const updatePaymentByOrderId = async (razorpayOrderId, data) => {
  return await Payment.findOneAndUpdate({ razorpayOrderId }, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

/* =========================================================
   GET CLIENT PAYMENTS
========================================================= */

const findPaymentsByClientId = async (clientId) => {
  return await Payment.find({
    clientId,
  })
    .populate({
      path: "therapistId",
      select: "_id name slug specializations languages",
    })
    .populate({
      path: "sessionId",
      select: "_id date startTime endTime duration status paymentStatus",
    })
    .sort({ createdAt: -1 })
    .lean();
};

/* =========================================================
   GET THERAPIST PAYMENTS
========================================================= */

const findPaymentsByTherapistId = async (therapistId) => {
  return await Payment.find({
    therapistId,
  })
    .sort({ createdAt: -1 })
    .lean();
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createPayment,
  findPaymentById,
  findPaymentByOrderId,
  findPaymentByRazorpayPaymentId,
  updatePayment,
  updatePaymentByOrderId,
  findPaymentsByClientId,
  findPaymentsByTherapistId,
};
