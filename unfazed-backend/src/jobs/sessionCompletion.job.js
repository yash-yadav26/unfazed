const cron = require("node-cron");

const {
  completeExpiredSessions,
} = require("../modules/session/services/session.service");

const startSessionCompletionJob = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const completedCount = await completeExpiredSessions();

        if (completedCount > 0) {
          console.log(
            `[SessionCompletionJob] ${completedCount} expired session(s) marked as COMPLETED.`,
          );
        }
      } catch (error) {
        console.error(
          "[SessionCompletionJob] Failed to complete expired sessions:",
          error,
        );
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  console.log("[SessionCompletionJob] Started. Checking every minute.");
};

module.exports = startSessionCompletionJob;
