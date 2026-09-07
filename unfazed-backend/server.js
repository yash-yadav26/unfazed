const startReminderJob = require("./src/jobs/reminder.job");
const startSessionCompletionJob = require("./src/jobs/sessionCompletion.job");
const initializeSocket = require("./src/socket/socket");

const http = require("http");

const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/*                              Start Server                                  */
/* -------------------------------------------------------------------------- */

const startServer = async () => {
  try {
    /* ----------------------------- Database ------------------------------- */

    await connectDB();

    /* ------------------------------ HTTP Server --------------------------- */

    const server = http.createServer(app);

    /* ------------------------------ Socket.io ----------------------------- */

    initializeSocket(server);

    /* ------------------------------ Start Server -------------------------- */

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      startReminderJob();

      startSessionCompletionJob();
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    process.exit(1);
  }
};

startServer();
