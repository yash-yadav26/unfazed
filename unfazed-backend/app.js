require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const errorHandler = require("./src/middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const authRoutes = require("./src/modules/auth");
const therapistRoutes = require("./src/modules/therapist");
const clientRoutes = require("./src/modules/client");
const schedulingRoutes = require("./src/modules/scheduling");
const sessionRoutes = require("./src/modules/session");
const paymentRoutes = require("./src/modules/payment");
const notesRoutes = require("./src/modules/notes");
const notificationRoutes = require("./src/modules/notification");
const therapistAnalyticsRoutes = require("./src/modules/therapistanalytics");
const  chatRoutes  = require("./src/modules/chat");


const app = express();

// Security
app.use(helmet());

// CORS

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Compression
app.use(compression());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Unfazed backend is running.",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes will come here
// app.use("/api/auth", authRoutes);
// app.use("/api/therapists", therapistRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/therapists", therapistRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api/scheduling", schedulingRoutes);

app.use("/api/session", sessionRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/notes", notesRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/analytics", therapistAnalyticsRoutes);

app.use("/api/chat", chatRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
