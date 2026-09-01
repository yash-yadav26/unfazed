import api from "./axios";

// ===============================
// Register User
// ===============================

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

// ===============================
// Login User
// ===============================

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

// ===============================
// Forgot Password
// ===============================

export const forgotPassword = async (data) => {
  const response = await api.post("/auth/forgot-password", data);

  return response.data;
};

// ===============================
// Verify OTP
// ===============================

export const verifyOtp = async (data) => {
  const response = await api.post("/auth/verify-otp", data);

  return response.data;
};

// ===============================
// Reset Password
// ===============================

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);

  return response.data;
};
