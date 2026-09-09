import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   ERROR MESSAGE HELPERS
========================================================= */

/**
 * Safely converts different API error values
 * into a readable message.
 */
const extractMessage = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractMessage(item))
      .filter(Boolean)
      .join(" • ");
  }

  if (typeof value === "object") {
    return (
      extractMessage(value.message) ||
      extractMessage(value.msg) ||
      extractMessage(value.error) ||
      extractMessage(value.detail) ||
      extractMessage(value.reason) ||
      ""
    );
  }

  return "";
};

/**
 * Recursively searches common API error structures.
 */
const findValidationMessages = (value, depth = 0) => {
  if (!value || depth > 5) {
    return [];
  }

  if (typeof value === "string") {
    const message = value.trim();

    return message ? [message] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => findValidationMessages(item, depth + 1));
  }

  if (typeof value !== "object") {
    return [];
  }

  const messages = [];

  /* -------------------------------------------------------
     Direct message-like fields
  ------------------------------------------------------- */

  for (const key of ["message", "msg", "detail", "reason"]) {
    const message = extractMessage(value[key]);

    if (
      message &&
      !["validation failed", "request failed"].includes(message.toLowerCase())
    ) {
      messages.push(message);
    }
  }

  /* -------------------------------------------------------
     Validation error collections
  ------------------------------------------------------- */

  for (const key of [
    "errors",
    "issues",
    "details",
    "fieldErrors",
    "validationErrors",
  ]) {
    if (value[key]) {
      messages.push(...findValidationMessages(value[key], depth + 1));
    }
  }

  /* -------------------------------------------------------
     Nested response structures
  ------------------------------------------------------- */

  for (const key of ["error", "data", "payload", "result"]) {
    if (value[key] && typeof value[key] === "object") {
      messages.push(...findValidationMessages(value[key], depth + 1));
    }
  }

  return messages;
};

/**
 * Gets the most useful error message for the user.
 */
const getApiErrorMessage = (error) => {
  const data = error?.response?.data;

  /* -------------------------------------------------------
     1. Detailed validation messages
  ------------------------------------------------------- */

  const detailedMessages = findValidationMessages(data)
    .map((message) => message.trim())
    .filter(Boolean);

  const uniqueMessages = [...new Set(detailedMessages)];

  if (uniqueMessages.length > 0) {
    return uniqueMessages.join(" • ");
  }

  /* -------------------------------------------------------
     2. Normal backend message
  ------------------------------------------------------- */

  const backendMessage = extractMessage(data?.message);

  if (
    backendMessage &&
    !["validation failed", "request failed"].includes(
      backendMessage.toLowerCase(),
    )
  ) {
    return backendMessage;
  }

  /* -------------------------------------------------------
     3. Nested error message
  ------------------------------------------------------- */

  const nestedErrorMessage = extractMessage(data?.error);

  if (
    nestedErrorMessage &&
    !["validation failed", "request failed"].includes(
      nestedErrorMessage.toLowerCase(),
    )
  ) {
    return nestedErrorMessage;
  }

  /* -------------------------------------------------------
     4. Network error
  ------------------------------------------------------- */

  if (!error?.response) {
    return "Unable to connect to Unfazed. Please check your internet connection.";
  }

  /* -------------------------------------------------------
     5. HTTP status fallback
  ------------------------------------------------------- */

  const status = error.response.status;

  switch (status) {
    case 400:
      return "Please check your details and try again.";

    case 401:
      return "Your session has expired. Please log in again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This action conflicts with existing data.";

    case 422:
      return "Please check the entered information.";

    default:
      if (status >= 500) {
        return "Something went wrong on the server. Please try again.";
      }

      return "Something went wrong. Please try again.";
  }
};

/* =========================================================
   REQUEST INTERCEPTOR
   Automatically attaches JWT token.
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/* =========================================================
   RESPONSE INTERCEPTOR
   Centralized API error toast.
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    /*
     * Background API requests can disable
     * the global error toast.
     *
     * Example:
     *
     * api.get("/notifications", {
     *   skipToast: true,
     * });
     */

    const skipToast = error?.config?.skipToast === true;

    if (!skipToast) {
      const message = getApiErrorMessage(error);

      toast.error(message, {
        id: "api-error",
      });
    }

    return Promise.reject(error);
  },
);

export default api;
