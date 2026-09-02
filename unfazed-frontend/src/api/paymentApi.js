import api from "./axios";

// ===============================
// Create Razorpay Order
// ===============================

export const createPaymentOrder = async (data) => {
  const response = await api.post("/payment/create-order", data);

  return response.data;
};

// ===============================
// Verify Payment
// ===============================

export const verifyPayment = async (data) => {
  const response = await api.post("/payment/verify", data);

  return response.data;
};

// ===============================
// Complete Payment + Book Session
// ===============================

export const completePayment = async (data) => {
  const response = await api.post("/payment/complete", data);

  return response.data;
};

// ===============================
// Get My Payment History
// ===============================

export const getMyPayments = async () => {
  const response = await api.get("/payment/my-payments");

  return response.data;
};
