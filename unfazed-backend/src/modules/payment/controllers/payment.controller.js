const paymentService = require("../services/payment.service");

const ApiResponse = require("../../../utils/apiResponse.js");
const asyncHandler = require("../../../utils/asyncHandler.js");

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

const createOrderController = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentOrder(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Payment order created successfully."));
});

/* =========================================================
   VERIFY PAYMENT
========================================================= */

const verifyPaymentController = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Payment verified successfully."));
});

/* =========================================================
   VERIFY PAYMENT + CREATE SESSION
========================================================= */

const completePaymentController = asyncHandler(async (req, res) => {
  const result = await paymentService.completePaymentAndCreateSession(
    req.user.id,
    req.validatedBody,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Payment verified and session booked successfully.",
      ),
    );
});

/* =========================================================
   GET MY PAYMENTS
========================================================= */

const getMyPaymentsController = asyncHandler(async (req, res) => {
  const result = await paymentService.getMyPayments(req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Payment history fetched successfully."),
    );
});
/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createOrderController,
  verifyPaymentController,
  completePaymentController,
  getMyPaymentsController,
};
