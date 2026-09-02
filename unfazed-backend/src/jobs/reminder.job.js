const cron = require("node-cron");

const {
  sendUpcomingSessionReminders,
} = require("../modules/notification/services/reminder.service");

// ---------------------------------------------------------------------------
// Session Reminder Job
// ---------------------------------------------------------------------------

// Cron schedule:
//
// ┌───────────── minute
// │ ┌─────────── hour
// │ │ ┌───────── day of month
// │ │ │ ┌─────── month
// │ │ │ │ ┌───── day of week
// │ │ │ │ │
// * * * * *
//
// "*/5 * * * *" = every 5 minutes

const startReminderJob = () => {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      try {
        const result = await sendUpcomingSessionReminders();

        console.log(
          `[Reminder Job] Processed: ${result.processed}, Reminders sent: ${result.remindersSent}`,
        );
      } catch (error) {
        console.error(
          "[Reminder Job] Failed to process session reminders:",
          error,
        );
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  console.log(
    "✅ Session reminder cron job started. Running every 5 minutes.",
  );
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

module.exports = startReminderJob;